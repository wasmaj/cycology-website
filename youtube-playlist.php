<?php
/* =========================================================
   youtube-playlist.php — Cycology YouTube playlist feed
   ---------------------------------------------------------
   Returns the club's YouTube playlist as JSON so the videos
   page can build itself from the live playlist. Update the
   playlist on YouTube and the website follows automatically.

   Usage:  /youtube-playlist.php
   Output: { "playlist": "...", "count": 12, "videos": [
              { "id": "...", "title": "...", "published": "..." }, ...
            ] }   // newest first

   TWO MODES:
   1. No API key (default) — reads the public playlist RSS feed.
      Works out of the box, but YouTube caps that feed at ~15 videos.
   2. With an API key — set $API_KEY below to a YouTube Data API v3
      key. Removes the 15-video cap (handles the full playlist).
      Get one at https://console.cloud.google.com/apis/credentials
      (enable "YouTube Data API v3"). Restrict it to your domain.

   Results are cached for $CACHE_TTL seconds so YouTube isn't hit on
   every page view. Runs on PHP 5.4+ shared hosting.
   ========================================================= */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// ---------- CONFIG ----------
$PLAYLIST_ID = 'PLzhU3D81Vqn5aiBIDDB121c6B41iHSMFC';
$API_KEY     = '';      // optional — see note above
$CACHE_TTL   = 1800;    // 30 minutes
// ----------------------------

$cacheFile = sys_get_temp_dir() . '/yt-playlist-' . md5($PLAYLIST_ID . $API_KEY) . '.json';

// Serve from cache when fresh.
if (is_readable($cacheFile) && (time() - filemtime($cacheFile)) < $CACHE_TTL) {
    $cached = file_get_contents($cacheFile);
    if ($cached !== false && $cached !== '') {
        echo $cached;
        exit;
    }
}

function http_get($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_USERAGENT, 'CycologySite/1.0');
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ($body !== false && $code >= 200 && $code < 300) ? $body : false;
    }
    if (ini_get('allow_url_fopen')) {
        $ctx = stream_context_create(array(
            'http' => array('timeout' => 10, 'user_agent' => 'CycologySite/1.0'),
        ));
        return @file_get_contents($url, false, $ctx);
    }
    return false;
}

$videos = array();

// ---- Mode 1: YouTube Data API (full playlist, needs a key) ----
if ($API_KEY !== '') {
    $pageToken = '';
    do {
        $url = 'https://www.googleapis.com/youtube/v3/playlistItems'
             . '?part=snippet,contentDetails&maxResults=50'
             . '&playlistId=' . urlencode($PLAYLIST_ID)
             . '&key=' . urlencode($API_KEY)
             . ($pageToken !== '' ? '&pageToken=' . urlencode($pageToken) : '');

        $body = http_get($url);
        if ($body === false) break;

        $json = json_decode($body, true);
        if (!isset($json['items'])) break;

        foreach ($json['items'] as $item) {
            $snip = isset($item['snippet']) ? $item['snippet'] : array();
            $vid  = isset($snip['resourceId']['videoId']) ? $snip['resourceId']['videoId'] : '';
            $title = isset($snip['title']) ? $snip['title'] : '';
            if ($vid === '' || $title === 'Private video' || $title === 'Deleted video') continue;

            // videoPublishedAt = when the VIDEO went live (not when it was
            // added to the playlist), which is what we sort by.
            $pub = isset($item['contentDetails']['videoPublishedAt'])
                 ? $item['contentDetails']['videoPublishedAt']
                 : (isset($snip['publishedAt']) ? $snip['publishedAt'] : '');

            $videos[] = array('id' => $vid, 'title' => $title, 'published' => $pub);
        }

        $pageToken = isset($json['nextPageToken']) ? $json['nextPageToken'] : '';
    } while ($pageToken !== '' && count($videos) < 200);
}

// ---- Mode 2: public RSS feed (no key; ~15 video cap) ----
if (empty($videos)) {
    $body = http_get('https://www.youtube.com/feeds/videos.xml?playlist_id=' . urlencode($PLAYLIST_ID));
    if ($body !== false) {
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($body);
        if ($xml !== false && isset($xml->entry)) {
            foreach ($xml->entry as $entry) {
                $yt = $entry->children('http://www.youtube.com/xml/schemas/2015');
                $vid = (string) $yt->videoId;
                if ($vid === '') continue;
                $videos[] = array(
                    'id'        => $vid,
                    'title'     => (string) $entry->title,
                    'published' => (string) $entry->published,
                );
            }
        }
    }
}

if (empty($videos)) {
    http_response_code(502);
    echo json_encode(array('error' => 'could not load playlist'));
    exit;
}

// Newest first (ISO-8601 dates sort correctly as strings).
usort($videos, function ($a, $b) {
    return strcmp($b['published'], $a['published']);
});

$out = json_encode(array(
    'playlist' => $PLAYLIST_ID,
    'count'    => count($videos),
    'videos'   => $videos,
));

@file_put_contents($cacheFile, $out);
echo $out;
