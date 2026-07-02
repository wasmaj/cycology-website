World Bicycle Day 2025 — photo album
====================================

1. Drop the event photos into this folder.
   Recommended: name them photo-001.jpg, photo-002.jpg, ... so they sort
   in order. Any web image works (.jpg .jpeg .png .webp .gif).

2. List them in js/gallery.js so they appear on the site. Find the
   "world-bicycle-day-2025" entry in the ALBUMS array and fill in `photos`:

       {
         slug: 'world-bicycle-day-2025',
         title: 'World Bicycle Day 2025',
         photos: seq(24)          // if you named them photo-001..photo-024
         // or list them: photos: ['photo-001.jpg', 'DSC1234.jpg', ...]
       }

   (`seq(N)` expands to photo-001.jpg ... photo-0NN.jpg.)

Until photos are added, the album shows a "Photos coming soon" placeholder
on the gallery page — nothing looks broken.
