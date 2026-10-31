import { useState, useEffect, useDeferredValue, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import { AuthProvider, useAuth } from './auth/AuthProvider.jsx';
import { apiRequest } from './lib/api.js';
import fallbackImage from './assets/jharkhand-landscape.svg';
import './App.css';

/* =========================================================
   DATA
========================================================= */

const destinations = [
  {
    name: 'Ranchi',
    image:
      'https://tse1.mm.bing.net/th/id/OIP.56lWcBtzk-tHLRqdvkIiVQHaEK?pid=Api',
    tagline: 'Waterfalls, hills and a lively capital city.',
    details:
      'Ranchi is the natural gateway to Jharkhand. Spend a morning at Dassam or Hundru Falls, take in the views at Tagore Hill, and enjoy the city’s parks, markets and relaxed café culture.',
    highlights: ['Hundru & Dassam Falls', 'Tagore Hill', 'Rock Garden'],
  },

  {
    name: 'Jamshedpur',
    image:
      'https://media.radissonhotels.net/image/radisson-hotel-jamshedpur/exterior/16256-169071-m35465959.jpg',
    tagline: 'A green, well-planned city beside the Dalma hills.',
    details:
      'Known as the Steel City, Jamshedpur blends urban energy with surprisingly green escapes. Jubilee Park, Dimna Lake and the nearby Dalma Wildlife Sanctuary make it ideal for a balanced city break.',
    highlights: [
      'Jubilee Park',
      'Dimna Lake',
      'Dalma Wildlife Sanctuary',
    ],
  },

  {
    name: 'Deoghar',
    image:
      'https://baidyanathnagri.com/wp-content/uploads/2021/01/deoghar-bmd-e1610977799704.jpg',
    tagline: 'A spiritual centre filled with tradition and calm.',
    details:
      'Deoghar is home to Baba Baidyanath Dham, one of India’s most revered Shiva temples. Beyond the shrine, visitors find tranquil hills, local sweets and a warm pilgrim-town atmosphere.',
    highlights: [
      'Baidyanath Temple',
      'Trikut Pahar',
      'Naulakha Mandir',
    ],
  },

  {
    name: 'Dhanbad',
    image:
      'https://elements-resized.envatousercontent.com/elements-video-cover-images/f158567c-1324-499a-b0a8-3c167a8cce2e/video_preview/video_preview_0000.jpg?w=1200&h=630&cf_fit=crop&q=85&format=jpeg&s=0dd688c00a8f8f5ae2c3f2ada0a473198d34041562b4243f1b7160138e4fcc1a',
    tagline: 'Coal-country heritage and peaceful lakes.',
    details:
      'Dhanbad’s industrial character is balanced by calm natural corners. Explore the broad waters of Maithon Dam, visit Topchanchi Lake and discover the region’s stories of mining and enterprise.',
    highlights: ['Maithon Dam', 'Topchanchi Lake', 'Bhatinda Falls'],
  },

  {
    name: 'Hazaribagh',
    image:
      'https://i.pinimg.com/originals/b4/68/6f/b4686f63075cc59049bb2f4c2b231d7a.jpg',
    tagline: 'Forest trails, wildlife and fresh hill air.',
    details:
      'Hazaribagh is made for unhurried nature travel. Its national park, lakes and forested drives offer a quiet retreat for birdwatchers, photographers and families.',
    highlights: [
      'Hazaribagh National Park',
      'Canary Hill',
      'Hazaribagh Lake',
    ],
  },

  {
    name: 'Netarhat',
    image:
      'https://thumbs.dreamstime.com/b/netarhat-jharkhand-indian-view-pictures-taken-vishal-singh-170710563.jpg',
    tagline: 'Jharkhand’s beloved hill station.',
    details:
      'Often called the Queen of Chotanagpur, Netarhat rewards visitors with pine-lined roads, cool weather and golden sunrise and sunset views.',
    highlights: [
      'Magnolia Point',
      'Upper Ghaghri Falls',
      'Netarhat Dam',
    ],
  },
];

const attractions = [
  {
    name: 'Hundru Falls',
    place: 'Ranchi',
    category: '💧 Waterfall',
    rating: '9.8',
    image:
      'https://media-cdn.tripadvisor.com/media/photo-s/13/40/03/f8/hudru-a-falls-to-visit.jpg',
    details:
      'The Subarnarekha River plunges dramatically at Hundru Falls, creating one of Jharkhand’s most photographed views.',
    best: 'Monsoon and post-monsoon; use sturdy footwear for the steps.',
    lat: 23.4497246,
    lng: 85.6666868,
    hours: 'Daily, 10:00 AM – 4:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Super Townhouse Ranchi',
        phone: '+91 124 433 0599',
      },
      {
        type: 'Restaurant',
        name: 'Anardana, Ranchi',
        phone: '+91 73668 87444',
      },
    ],
  },

  {
    name: 'Dassam Falls',
    place: 'Ranchi',
    category: '💧 Waterfall',
    rating: '9.6',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Dassam_falls.jpg/760px-Mapcarta.jpg',
    details:
      'The Kanchi River rushes over rocky tiers at Dassam Falls, creating a powerful forest-framed cascade.',
    best: 'Monsoon and post-monsoon; keep away from slippery rocks.',
    lat: 23.1462515,
    lng: 85.4672203,
    hours: 'Daily, 8:00 AM – 6:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Hotel Pratap Grand, Ranchi',
        phone: '+91 90603 22001',
      },
      {
        type: 'Restaurant',
        name: 'Kaveri Restaurant, Ranchi',
        phone: '+91 82355 20520',
      },
    ],
  },

  {
    name: 'Jonha Falls',
    place: 'Ranchi',
    category: '💧 Waterfall',
    rating: '9.4',
    image:
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=900&q=80',
    details:
      'Jonha Falls is a scenic cascade surrounded by wooded hills, reached by a rewarding walk down to the water.',
    best: 'July to February, when the landscape is green and the weather is pleasant.',
    lat: 23.3420767,
    lng: 85.6085503,
    hours: 'Daily, 8:00 AM – 5:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Super Townhouse Ranchi',
        phone: '+91 124 433 0599',
      },
      {
        type: 'Restaurant',
        name: 'Kaveri Restaurant, Ranchi',
        phone: '+91 82355 20520',
      },
    ],
  },

  {
    name: 'Patratu Valley',
    place: 'Ramgarh',
    category: '🏔️ Nature',
    rating: '9.5',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80',
    details:
      'Patratu Valley is loved for its winding roads, open viewpoints and the calm waters of Patratu Dam nearby.',
    best: 'Early morning or sunset, especially from October to February.',
    lat: 23.6599802,
    lng: 85.3060865,
    hours: 'Open access; roads best driven 6:00 AM – 6:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Hotel Shakti Palace, Ramgarh',
        phone: '+91 94311 05094',
      },
    ],
  },

  {
    name: 'Netarhat',
    place: 'Latehar',
    category: '🌲 Hill Station',
    rating: '9.6',
    image:
      'https://thumbs.dreamstime.com/b/netarhat-jharkhand-indian-view-pictures-taken-vishal-singh-170710563.jpg',
    details:
      'Jharkhand’s beloved hill station offers cool weather, pine-lined roads and memorable sunrise and sunset views.',
    best: 'October to February for clear skies and cool evenings.',
    lat: 23.4806539,
    lng: 84.2651503,
    hours: 'Open access year-round',
    nearby: [
      {
        type: 'Hotel',
        name: 'Lake View Resort, Netarhat',
        phone: '+91 96935 12065',
      },
      {
        type: 'Hotel',
        name: 'Netarhat Art Village Resort',
        phone: '+91 62872 82806',
      },
    ],
  },

  {
    name: 'Lodh Falls',
    place: 'Latehar',
    category: '💧 Waterfall',
    rating: '9.5',
    image:
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=900&q=80',
    details:
      'Lodh Falls is a dramatic multi-tiered waterfall in a forested landscape near Netarhat.',
    best: 'Post-monsoon is ideal for a strong flow and safer access.',
    lat: 23.4809104,
    lng: 84.0194711,
    hours: 'Daily, 8:00 AM – 4:30 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Lake View Resort, Netarhat',
        phone: '+91 96935 12065',
      },
    ],
  },

  {
    name: 'Betla National Park',
    place: 'Latehar',
    category: '🐘 Wildlife',
    rating: '9.4',
    image:
      'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=900&q=80',
    details:
      'Betla National Park combines sal forest, wildlife sightings and historic ruins in the Palamu region.',
    best: 'November to March for comfortable safaris and wildlife viewing.',
    lat: 23.8854596,
    lng: 84.1920863,
    hours: 'Wed–Mon, 6:00 – 10:00 AM & 2:00 – 5:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Hotel Park View, Betla',
        phone: '+91 82992 32763',
      },
    ],
  },

  {
    name: 'Palamu Fort',
    place: 'Palamu',
    category: '🏰 Heritage',
    rating: '9.2',
    image:
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=80',
    details:
      'The old and new Palamu Forts stand amid forested hills and tell stories of the Chero rulers.',
    best: 'October to February, paired with a Betla visit.',
    lat: 23.8949232,
    lng: 84.2296908,
    hours: 'Daily, 7:00 AM – 6:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Hotel Park View, Betla',
        phone: '+91 82992 32763',
      },
    ],
  },

  {
    name: 'Baidyanath Dham',
    place: 'Deoghar',
    category: '🛕 Religious',
    rating: '9.5',
    image:
      'https://2.bp.blogspot.com/-rYEnl44Nefo/VbZbSoiwavI/AAAAAAAAAOI/R-q9vWuwOu0/s1600/new_header.jpg',
    details:
      'Baba Baidyanath Dham is a deeply cherished Jyotirlinga shrine and a central pilgrimage site in Deoghar.',
    best: 'Early morning, outside the busy Shravan pilgrimage season.',
    lat: 24.4925332,
    lng: 86.7000407,
    hours: 'Daily, 4:00 AM – 4:00 PM & 6:00 – 9:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Hotel Imperial Heights, Deoghar',
        phone: '+91 91234 61616',
      },
      {
        type: 'Restaurant',
        name: 'Nirvana – The Rooftop Cafe, Deoghar',
        phone: '+91 75430 32277',
      },
    ],
  },

  {
    name: 'Trikut Parvat',
    place: 'Deoghar',
    category: '🏔️ Adventure',
    rating: '9.3',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80',
    details:
      'Trikut Parvat offers rocky scenery, temple associations and expansive views near Deoghar.',
    best: 'October to March, starting early in the day.',
    lat: 24.4983333,
    lng: 86.8369444,
    hours: 'Open access; ropeway/trek best 6:00 AM – 6:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Ishaan Sarovar Portico, Deoghar',
        phone: '+91 63998 33833',
      },
      {
        type: 'Restaurant',
        name: 'Twilight Restaurant, Deoghar',
        phone: '+91 91234 61616',
      },
    ],
  },

  {
    name: 'Parasnath / Shikharji',
    place: 'Giridih',
    category: '🛕 Religious',
    rating: '9.7',
    image:
      'https://media.tripinvites.com/places/giridih/parasnath-hills-giridih-jharkhand-featured-750x500.jpg',
    details:
      'Shikharji is a revered Jain pilgrimage hill with temples, forested slopes and broad valley views.',
    best: 'October to March, when the climb is more comfortable.',
    lat: 23.9625,
    lng: 86.1327778,
    hours: 'Open access; most pilgrims begin the climb around 4:00 AM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Sonnesta Grand Hotel & Resort, Isri',
        phone: '+91 93413 30551',
      },
    ],
  },

  {
    name: 'Deoghar',
    place: 'Deoghar',
    category: '🛕 Religious',
    rating: '9.4',
    image:
      'https://baidyanathnagri.com/wp-content/uploads/2021/01/deoghar-bmd-e1610977799704.jpg',
    details:
      'Deoghar blends spiritual heritage, temple lanes, local sweets and nearby hill excursions.',
    best: 'October to March for a relaxed cultural visit.',
    lat: 24.485179,
    lng: 86.694785,
    hours: 'Town accessible year-round',
    nearby: [
      {
        type: 'Hotel',
        name: 'Hotel Imperial Heights, Deoghar',
        phone: '+91 91234 61616',
      },
      {
        type: 'Restaurant',
        name: 'Nirvana – The Rooftop Cafe, Deoghar',
        phone: '+91 75430 32277',
      },
    ],
  },

  {
    name: 'Dalma Wildlife Sanctuary',
    place: 'Jamshedpur',
    category: '🐘 Wildlife',
    rating: '9.3',
    image:
      'https://tripxl.com/blog/wp-content/uploads/2024/09/Dalma-Wildlife-Sanctuary-OG-Photo.jpg',
    details:
      'The Dalma hills offer forest drives, birdlife and the chance to spot elephants and deer responsibly.',
    best: 'October to March for clearer trails and pleasant weather.',
    lat: 22.8965883,
    lng: 86.2061027,
    hours: 'Daily, 6:00 AM – 5:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Ginger Jamshedpur, Bistupur',
        phone: '+91 657 666 3333',
      },
      {
        type: 'Restaurant',
        name: 'Guild 45, Bistupur',
        phone: '+91 76460 14545',
      },
    ],
  },

  {
    name: 'Dimna Lake',
    place: 'Jamshedpur',
    category: '🌊 Lake',
    rating: '9.2',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80',
    details:
      'Dimna Lake is a peaceful reservoir at the foot of the Dalma hills, ideal for a quiet scenic break.',
    best: 'Early morning or late afternoon for gentle light.',
    lat: 22.861207,
    lng: 86.2447763,
    hours: 'Daily, approx. 6:00 AM – 6:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Ginger Jamshedpur, Bistupur',
        phone: '+91 657 666 3333',
      },
      {
        type: 'Restaurant',
        name: 'Guild 45, Bistupur',
        phone: '+91 76460 14545',
      },
    ],
  },

  {
    name: 'Jubilee Park',
    place: 'Jamshedpur',
    category: '🌳 Park',
    rating: '9.1',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80',
    details:
      'Jubilee Park is a green city escape with landscaped walks, gardens and evening light displays.',
    best: 'Evenings, especially during pleasant winter months.',
    lat: 22.8115492,
    lng: 86.1967879,
    hours: 'Hours vary by season — check locally before visiting',
    nearby: [
      {
        type: 'Hotel',
        name: 'Ginger Jamshedpur, Bistupur',
        phone: '+91 657 666 3333',
      },
      {
        type: 'Restaurant',
        name: 'Guild 45, Bistupur',
        phone: '+91 76460 14545',
      },
    ],
  },

  {
    name: 'Maithon Dam',
    place: 'Dhanbad',
    category: '🌊 Dam',
    rating: '9.3',
    image:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=80',
    details:
      'Maithon Dam spreads across a wide reservoir with open water views and peaceful picnic spots.',
    best: 'October to February for clear weather and outdoor time.',
    lat: 23.7851098,
    lng: 86.811867,
    hours: 'Daily, 6:00 AM – 6:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Grand Mirage Dhanbad',
        phone: '+91 326 350 9100',
      },
      {
        type: 'Restaurant',
        name: 'Skylit Restro Bar, Dhanbad',
        phone: '+91 88639 26688',
      },
    ],
  },

  {
    name: 'Topchanchi Lake',
    place: 'Dhanbad',
    category: '🌊 Lake',
    rating: '9.0',
    image:
      'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=900&q=80',
    details:
      'Topchanchi Lake is a calm lakeside retreat surrounded by low hills and greenery.',
    best: 'Winter mornings and late afternoons.',
    lat: 23.9220417,
    lng: 86.182169,
    hours: 'Open access; best visited 6:00 AM – 6:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Grand Mirage Dhanbad',
        phone: '+91 326 350 9100',
      },
      {
        type: 'Restaurant',
        name: 'Skylit Restro Bar, Dhanbad',
        phone: '+91 88639 26688',
      },
    ],
  },

  {
    name: 'Masanjore Dam',
    place: 'Dumka',
    category: '🌊 Dam',
    rating: '9.2',
    image:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=900&q=80',
    details:
      'Masanjore Dam, set amid the rolling landscape of Dumka, is a popular scenic and picnic destination.',
    best: 'October to February for clear reservoir views.',
    lat: 24.1067705,
    lng: 87.3083697,
    hours: 'Daily, 10:00 AM – 5:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'The Heritage, Dumka',
        phone: '+91 99559 31388',
      },
    ],
  },

  {
    name: 'Panchghagh Falls',
    place: 'Khunti',
    category: '💧 Waterfall',
    rating: '9.3',
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=900&q=80',
    details:
      'Panchghagh Falls divides into five visible streams, creating a lively and scenic natural stop.',
    best: 'Post-monsoon, when water levels are high but conditions are safer.',
    lat: 22.9453777,
    lng: 85.2566079,
    hours: 'Daily, 6:00 AM – 5:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Moments Resort, Khunti Road',
        phone: '+91 75202 79911',
      },
      {
        type: 'Restaurant',
        name: 'Aangan, Khunti–Ranchi Rd',
        phone: '+91 63877 82973',
      },
    ],
  },

  {
    name: 'Maluti Temples',
    place: 'Dumka',
    category: '🏛️ Heritage',
    rating: '9.2',
    image:
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=80',
    details:
      'Maluti is known for its cluster of terracotta temples, offering a quiet window into regional heritage.',
    best: 'October to March for a comfortable heritage walk.',
    lat: 24.1555683,
    lng: 87.6749992,
    hours: 'Open access; temple complex generally 6:00 AM – 7:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'The Heritage, Dumka',
        phone: '+91 99559 31388',
      },
    ],
  },

  {
    name: 'Rajmahal Hills',
    place: 'Sahibganj',
    category: '⛰️ Nature',
    rating: '9.1',
    image:
      'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=900&q=80',
    details:
      'The Rajmahal Hills bring together river views, wooded slopes and the geological character of the region.',
    best: 'Winter for clearer views and cooler exploration.',
    lat: 25.1329594,
    lng: 87.6169084,
    hours: 'Open access year-round',
    nearby: [
      {
        type: 'Hotel',
        name: 'Surya Plaza Hotel, Sahibganj',
        phone: '+91 92641 97987',
      },
    ],
  },

  {
    name: 'Udhwa Lake',
    place: 'Sahibganj',
    category: '🐦 Wildlife',
    rating: '9.0',
    image:
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=900&q=80',
    details:
      'Udhwa Lake Bird Sanctuary is a wetland haven for birdwatchers, especially in the migratory season.',
    best: 'November to February for migratory birds.',
    lat: 24.9691416,
    lng: 87.8323621,
    hours: 'Open 24 hours; boating typically available 8:00 AM – 5:00 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Surya Plaza Hotel, Sahibganj',
        phone: '+91 92641 97987',
      },
    ],
  },

  {
    name: 'Hazaribagh',
    place: 'Hazaribagh',
    category: '🌲 Nature',
    rating: '9.2',
    image:
      'https://i.pinimg.com/originals/b4/68/6f/b4686f63075cc59049bb2f4c2b231d7a.jpg',
    details:
      'Hazaribagh is a refreshing nature base with forest drives, lakes and hill viewpoints.',
    best: 'October to March for outdoor exploration.',
    lat: 24.142977,
    lng: 85.3822027,
    hours: 'Sanctuary hours vary — check with the forest department before visiting',
    nearby: [
      {
        type: 'Hotel',
        name: 'Dayal Heritage, Hazaribagh',
        phone: '+91 96089 56725',
      },
      {
        type: 'Restaurant',
        name: 'Skylight Garden Restaurant, Hazaribagh',
      },
    ],
  },

  {
    name: 'Surajkund',
    place: 'Hazaribagh',
    category: '♨️ Hot Spring',
    rating: '8.9',
    image:
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&q=80',
    details:
      'Surajkund is known for its naturally warm springs and is best enjoyed as a quiet wellness stop.',
    best: 'Winter, when the warm water is especially inviting.',
    lat: 24.1494036,
    lng: 85.6454236,
    hours: 'Open 24 hours',
    nearby: [
      {
        type: 'Hotel',
        name: 'Dayal Heritage, Hazaribagh',
        phone: '+91 96089 56725',
      },
      {
        type: 'Restaurant',
        name: 'Skylight Garden Restaurant, Hazaribagh',
      },
    ],
  },

  {
    name: 'Sun Temple, Ranchi',
    place: 'Ranchi',
    category: '🛕 Religious',
    rating: '9.1',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=80',
    details:
      'Ranchi’s Sun Temple is recognised for its chariot-shaped setting, open grounds and peaceful atmosphere.',
    best: 'Morning or late afternoon for softer light and fewer visitors.',
    lat: 23.1819594,
    lng: 85.5616646,
    hours: 'Daily, 6:15 AM – 6:30 PM',
    nearby: [
      {
        type: 'Hotel',
        name: 'Super Townhouse Ranchi',
        phone: '+91 124 433 0599',
      },
      {
        type: 'Restaurant',
        name: 'Anardana, Ranchi',
        phone: '+91 73668 87444',
      },
    ],
  },
];

const articles = [
  {
    title: 'A weekend guide to Ranchi’s waterfalls',
    category: 'Nature',
    excerpt:
      'Plan a refreshing two-day escape around Ranchi’s dramatic cascades, viewpoints and easy local food stops.',
    body:
      'Start at Hundru Falls early, then set aside a relaxed afternoon for Dassam Falls and a sunset view from Tagore Hill. The following day, visit Rock Garden and Kanke Dam. Keep rain gear and grippy footwear handy during the monsoon.',
  },

  {
    title: 'Deoghar: a thoughtful pilgrimage itinerary',
    category: 'Culture',
    excerpt:
      'Make space for prayer, local flavours and quiet moments around one of Jharkhand’s most important temples.',
    body:
      'Begin with an early visit to Baba Baidyanath Dham, then slow the pace with Naulakha Mandir and Trikut Pahar. Respect temple guidance, carry drinking water and try the region’s famous peda from a trusted local shop.',
  },

  {
    title: 'Why Netarhat deserves more than one sunset',
    category: 'Hills',
    excerpt:
      'From Magnolia Point to forest roads, here is how to linger in Jharkhand’s quiet hill station.',
    body:
      'Netarhat is best enjoyed without rushing. Watch the sun drop at Magnolia Point, make time for Upper Ghaghri Falls and enjoy the cool evening air on a forest drive. Book stays ahead for weekends and holiday periods.',
  },
];

const districts = [
  'Bokaro',
  'Chatra',
  'Deoghar',
  'Dhanbad',
  'Dumka',
  'East Singhbhum',
  'Garhwa',
  'Giridih',
  'Godda',
  'Gumla',
  'Hazaribagh',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Palamu',
  'Ramgarh',
  'Ranchi',
  'Sahibganj',
  'Saraikela-Kharsawan',
  'Simdega',
  'West Singhbhum',
];



const localProducts = [
  {
    name: 'Bamboo Craft',
    image:
      'https://content.jdmagicbox.com/quickquotes/listicle/listicle_1748502702278_ddjvt_3872x2592.jpg?impolicy=queryparam&im=Resize=(828,621),aspect=fit&q=75&width=828',
    origin: 'Khunti & West Singhbhum',
    description:
      'Hand-woven baskets, mats, trays and furniture crafted from local bamboo by village artisans — sturdy, eco-friendly and rooted in everyday tribal life.',
  },
  {
    name: 'Tribal Silver Jewellery',
    image:
      'https://content.jdmagicbox.com/quickquotes/listicle/listicle_1748503174317_1defj_1224x816.jpg?impolicy=queryparam&im=Resize=(828,621),aspect=fit&q=75&width=828',
    origin: 'Santhal & Ho communities',
    description:
      'Bold silver necklaces, hasli chokers and bangles worn during festivals, made using traditional techniques passed down through generations.',
  },
  {
    name: 'Dokra Metal Craft',
    image:
      'https://tse3.mm.bing.net/th/id/OIP.A42C6V0tqA9k0zcYsOm0vgAAAA?r=0&pid=Api&P=0&h=180',
    origin: 'Ranchi & Singhbhum',
    description:
      'Ancient lost-wax metal casting used to create figurines, jewellery and decorative pieces with a distinctive rustic, sculpted finish.',
  },
  {
    name: 'Sohrai & Khovar Painting',
    image:
      'https://i.pinimg.com/originals/08/95/38/089538756e47605c5b6c632b13cf8dbe.jpg',
    origin: 'Hazaribagh',
    description:
      'Striking wall art made with natural pigments and finger-combed patterns, traditionally painted by tribal women during harvest and wedding seasons.',
  },
  {
    name: 'Paitkar Scroll Painting',
    image:
      'https://tse1.mm.bing.net/th/id/OIP.E2rO2E4Yszf39k76PEfY5gHaDt?r=0&pid=Api&P=0&h=180',
    origin: 'Amadubi village',
    description:
      'One of India’s oldest scroll-painting traditions, telling folk stories panel by panel using natural, plant-based colours.',
  },
  {
    name: 'Tussar Silk',
    image:
      'https://tse3.mm.bing.net/th/id/OIP.0ArCiTAnB0em2I7ea6UgdwHaJB?r=0&pid=Api&P=0&h=180',
    origin: 'Santhal Pargana',
    description:
      'Naturally textured wild silk, hand-woven into sarees and stoles prized for their earthy sheen and durability.',
  },
  {
    name: 'Lac Bangles & Lacquerware',
    image:
      'https://content.jdmagicbox.com/quickquotes/listicle/listicle_1748503271422_20e2d_1224x834.jpg?impolicy=queryparam&im=Resize=(828,621),aspect=fit&q=75&width=828',
    origin: 'Ranchi region',
    description:
      'Brightly coloured bangles and wooden lacquerware, shaped and polished using resin extracted from lac insects.',
  },
  {
    name: 'Terracotta Craft',
    image:
      'https://indiancrafthub.com/wp-content/uploads/2025/01/DIY-Terracotta-Planters.jpeg',
    origin: 'Rural Jharkhand',
    description:
      'Hand-moulded clay pots, idols and decorative items fired using age-old techniques found across the state’s villages.',
  },
];

/* =========================================================
   HEADER
========================================================= */

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user: authUser, status: authStatus, setUser: setAuthUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [planCount, setPlanCount] = useState(0);

  useEffect(() => {
    let active = true;
    if (authStatus !== 'authenticated') {
      setPlanCount(0);
      return undefined;
    }
    const update = async () => {
      try {
        const { trips } = await apiRequest('/trips');
        if (active) setPlanCount(trips.length);
      } catch {
        if (active) setPlanCount(0);
      }
    };
    update();
    window.addEventListener('trip-plan-updated', update);
    return () => {
      active = false;
      window.removeEventListener('trip-plan-updated', update);
    };
  }, [authStatus, authUser?.id]);

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST', body: '{}' });
      setAuthUser(null);
      navigate('/');
    } catch {
      // Keep the account link visible if the API could not end the session.
    }
  };

  const authActions = authStatus === 'authenticated'
    ? <><Link className="button button--orange" to="/account">{authUser.name}</Link><button className="button button--dark" type="button" onClick={handleLogout}>Log out</button></>
    : authStatus === 'anonymous'
      ? <><Link className="button button--orange" to="/login">Create account</Link><Link className="button button--dark" to="/login">Log in</Link></>
      : <><button className="button button--dark" type="button" disabled>{authStatus === 'loading' ? 'Checking account…' : 'Account unavailable'}</button>{authStatus === 'error' && <button className="button button--orange" type="button" onClick={refreshUser}>Retry</button>}</>;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const goToSection = (id) => (event) => {
    event.preventDefault();
    closeMenu();
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="brand-area">
        <Link to="/" onClick={closeMenu}>
          <strong>Jharkhand</strong>
        </Link>

        <nav className={menuOpen ? 'is-open' : ''}>
          <Link to="/explore" onClick={closeMenu}>
            Explore
          </Link>
          <Link to="/trip-plan" onClick={closeMenu}>
            My trip ({planCount})
          </Link>

          <a href="/#attractions" onClick={goToSection('attractions')}>
            Attractions
          </a>

          <a href="/#state-guide" onClick={goToSection('state-guide')}>
            State guide
          </a>

          <a href="/#local-products" onClick={goToSection('local-products')}>
            Featured
          </a>

          <div className="nav-actions-mobile">
            {authStatus === 'authenticated'
              ? <><Link className="button button--orange" to="/account" onClick={closeMenu}>{authUser.name}</Link><button className="button button--dark" type="button" onClick={() => { closeMenu(); handleLogout(); }}>Log out</button></>
              : authStatus === 'anonymous'
                ? <><Link className="button button--orange" to="/login" onClick={closeMenu}>Create account</Link><Link className="button button--dark" to="/login" onClick={closeMenu}>Log in</Link></>
                : <><button className="button button--dark" type="button" disabled>{authStatus === 'loading' ? 'Checking account…' : 'Account unavailable'}</button>{authStatus === 'error' && <button className="button button--orange" type="button" onClick={refreshUser}>Retry</button>}</>}
          </div>
        </nav>
      </div>

      <div className="header-actions">
        <Link className="button button--dark" to="/trip-plan">My trip ({planCount})</Link>
        {authActions}
      </div>

      <button
        className={`menu-toggle${menuOpen ? ' is-active' : ''}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <Link className="site-footer__logo" to="/" aria-label="Jharkhand Tourism home">Jharkhand<span>.</span></Link>
          <p>Find waterfalls, forests, heritage and unforgettable journeys across the heart of India.</p>
          <a className="site-footer__official" href="https://tourism.jharkhand.gov.in/" target="_blank" rel="noopener noreferrer">
            Visit official Jharkhand Tourism <span aria-hidden="true">↗</span>
          </a>
        </div>

        <nav className="site-footer__links" aria-label="Footer navigation">
          <div>
            <h2>Explore</h2>
            <Link to="/" state={{ scrollTo: 'destinations' }}>Top destinations</Link>
            <Link to="/" state={{ scrollTo: 'attractions' }}>Places to explore</Link>
            <Link to="/" state={{ scrollTo: 'state-guide' }}>State guide</Link>
            <Link to="/" state={{ scrollTo: 'local-products' }}>Local crafts</Link>
          </div>
          <div>
            <h2>Plan your visit</h2>
            <Link to="/trip-plan">My trip</Link>
            <Link to="/explore">Travel stories</Link>
            <a href="https://tourism.jharkhand.gov.in/" target="_blank" rel="noopener noreferrer">Official travel information ↗</a>
          </div>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Jharkhand Tourism Guide</span>
        <p>Travel details can change. Confirm local conditions, opening hours and access before you travel. This guide is an independent project.</p>
      </div>
    </footer>
  );
}

/* =========================================================
   DETAIL PAGE
========================================================= */

function DetailPage({ item, kind }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status: authStatus } = useAuth();

  const isDestination = kind === 'destination';
  const isArticle = kind === 'article';
  const isAttraction = kind === 'attraction';

  const hasMap =
    isAttraction &&
    typeof item.lat === 'number' &&
    typeof item.lng === 'number';

  const mapsLink = hasMap
    ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
    : null;

  const backPath = isDestination
    ? '/'
    : isArticle
      ? '/explore'
      : '/#attractions';
  const planItem = { tripKey: `${kind}:${item.name || item.title}`, name: item.name || item.title, type: kind, place: item.place || '', path: isDestination ? `/destinations/${slug(item.name)}` : `/attractions/${slug(item.name)}` };
  const [inPlan, setInPlan] = useState(false);
  const [planBusy, setPlanBusy] = useState(false);
  const [planError, setPlanError] = useState('');

  useEffect(() => {
    let active = true;
    setInPlan(false);
    if (authStatus !== 'authenticated') return () => { active = false; };
    apiRequest('/trips').then(({ trips }) => {
      if (active) setInPlan(trips.some((entry) => entry.tripKey === planItem.tripKey));
    }).catch(() => {
      if (active) setPlanError('Could not load your saved trips. Please try again.');
    });
    return () => { active = false; };
  }, [authStatus, user?.id, planItem.tripKey]);

  const togglePlan = async () => {
    if (authStatus !== 'authenticated') {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setPlanBusy(true);
    setPlanError('');
    try {
      if (inPlan) {
        const { trips } = await apiRequest('/trips');
        const saved = trips.find((entry) => entry.tripKey === planItem.tripKey);
        if (saved) await apiRequest(`/trips/${saved.id}`, { method: 'DELETE' });
        setInPlan(false);
      } else {
        await apiRequest('/trips', { method: 'POST', body: JSON.stringify(planItem) });
        setInPlan(true);
      }
      window.dispatchEvent(new Event('trip-plan-updated'));
    } catch (error) {
      setPlanError(error.message || 'Could not update your saved trip.');
    } finally {
      setPlanBusy(false);
    }
  };

  return (
    <main id="main-content" className="tourism-app">
      <Header />

      <section className="detail-page">
        <button
          className="back-link"
          onClick={() => backPath === '/#attractions' ? navigate('/', { state: { scrollTo: 'attractions' } }) : navigate(backPath)}
        >
          ← Back to{' '}
          {isDestination
            ? 'destinations'
            : isArticle
              ? 'articles'
              : 'attractions'}
        </button>

        <div className="detail-hero">
          {item.image && (
            <img decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }}
              src={item.image}
              alt={item.name || item.title}
            />
          )}

          <div>
            <p className="eyebrow">
              {isDestination
                ? 'Top destination'
                : item.place || item.category}
            </p>

            <h1>{item.name || item.title}</h1>

            <p>{item.tagline || item.excerpt}</p>
            {!isArticle && <><button className="button button--orange" onClick={togglePlan} disabled={planBusy || authStatus === 'loading'}>{planBusy ? 'Saving…' : inPlan ? 'Remove from my trip' : 'Add to my trip'}</button>{planError && <p className="login-form__error" role="alert">{planError}</p>}{authStatus === 'anonymous' && <p className="info-note">Sign in to save this place to your trip.</p>}</>}
          </div>
        </div>

        <div className="detail-copy">
          <h2>
            About this{' '}
            {isDestination
              ? 'destination'
              : isArticle
                ? 'story'
                : 'attraction'}
          </h2>

          <p>{item.details || item.body}</p>

          {isDestination && (
            <>
              <h2>Don’t miss</h2>

              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </>
          )}

          {!isArticle && (
            <>
              <h2>Best time to visit</h2>

              <p>{item.best}</p>
            </>
          )}

          {hasMap && (
            <>
              <h2>Location on the map</h2>

              <div className="map-embed">
                <iframe
                  title={`Map showing ${item.name}`}
                  src={`https://www.google.com/maps?q=${item.lat},${item.lng}&z=13&output=embed`}
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <a
                className="maps-link"
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps →
              </a>
            </>
          )}

          {isAttraction && <p className="info-note">Confirm current access, opening hours, weather and local guidance before setting out. Details on this demo have not been independently verified.</p>}

          {isAttraction && hasMap && (
              <>
                <h2>Find nearby services</h2>
                <p>Search current map listings near this location. Confirm availability and contact details with the provider.</p>

                <ul className="nearby-list">
                  {['Hotels', 'Restaurants', 'Transport'].map((type) => <li key={type}><span className="nearby-list__type">{type}</span><a className="nearby-list__name" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/${encodeURIComponent(type)}+near+${item.lat},${item.lng}`}>View nearby {type.toLowerCase()} on Google Maps ↗</a></li>)}
                </ul>
              </>
            )}
        </div>

        {isAttraction && <ReviewsSection attractionName={item.name} />}
      </section>
      <SiteFooter />
    </main>
  );
}

/* =========================================================
   VISITOR REVIEWS
========================================================= */

function ReviewsSection({ attractionName }) {
  const storageKey = `attraction-reviews:${slug(attractionName)}`;

  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      setReviews(stored ? JSON.parse(stored) : []);
    } catch {
      setReviews([]);
    }

    setName('');
    setRating(0);
    setHoverRating(0);
    setComment('');
    setError('');
    setSubmitted(false);
  }, [storageKey]);

  const averageRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      ).toFixed(1)
      : null;

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Please share your name.');
      return;
    }

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a short thought about your visit.');
      return;
    }

    const newReview = {
      id: `${Date.now()}`,
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Storage may be unavailable (e.g. private browsing) — the review
      // still shows for this session even if it doesn't persist.
    }

    setName('');
    setRating(0);
    setHoverRating(0);
    setComment('');
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="reviews-section">
      <div className="reviews-section__heading">
        <div>
          <h2>Visitor feedback</h2>

          <p>
            Share your thoughts to help other travellers plan their trip
            to {attractionName}.
          </p>
          <p className="info-note">Feedback is stored only in this browser and is not visible to other visitors.</p>
        </div>

        {averageRating && (
          <div className="reviews-section__average">
            <span>★ {averageRating}</span>

            <p>
              {reviews.length}{' '}
              {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        )}
      </div>

      <form className="review-form" onSubmit={handleSubmit} noValidate>
        <div className="review-form__row">
          <label className="review-form__field">
            <span>Your name</span>

            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
              }}
              placeholder="e.g. Priya S."
            />
          </label>

          <div className="review-form__field">
            <span>Your rating</span>

            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    value <= (hoverRating || rating)
                      ? 'star-picker__star is-filled'
                      : 'star-picker__star'
                  }
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => {
                    setRating(value);
                    setError('');
                  }}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="review-form__field">
          <span>Share your thoughts</span>

          <textarea
            value={comment}
            onChange={(event) => {
              setComment(event.target.value);
              setError('');
            }}
            placeholder="What did you enjoy? Any tips for future visitors?"
            rows={4}
          />
        </label>

        {error && <p className="review-form__error">{error}</p>}

        {submitted && !error && (
          <p className="review-form__success">
            Thanks for sharing your experience!
          </p>
        )}

        <button type="submit" className="button button--orange">
          Post feedback
        </button>
      </form>

      <div className="review-list">
        {reviews.length === 0 ? (
          <p className="review-list__empty">
            No feedback yet — be the first to share your experience.
          </p>
        ) : (
          reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card__top">
                <span className="review-card__name">{review.name}</span>

                <span className="review-card__stars">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </span>
              </div>

              <p className="review-card__comment">{review.comment}</p>

              <span className="review-card__date">
                {new Date(review.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EXPLORE PAGE
========================================================= */

function ExplorePage() {
  return (
    <main id="main-content" className="tourism-app">
      <Header />

      <section className="article-page">
        <p className="eyebrow">Explore Jharkhand</p>

        <h1>Stories to help you plan your journey</h1>

        <p className="page-intro">
          Discover practical ideas, cultural context and places
          worth taking your time over.
        </p>

        <div className="article-grid">
          {articles.map((article) => (
            <article
              className="article-card"
              key={article.title}
            >
              <p className="eyebrow">{article.category}</p>

              <h2>{article.title}</h2>

              <p>{article.excerpt}</p>

              <Link
                to={`/articles/${slug(article.title)}`}
              >
                Read article →
              </Link>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  const location = useLocation();
  const [showAllAttractions, setShowAllAttractions] =
    useState(false);
  const [query, setQuery] = useState('');
  const [interest, setInterest] = useState('All interests');
  const [district, setDistrict] = useState('All districts');
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredAttractions = useMemo(() => attractions.filter((item) => {
    const searchableText = `${item.name} ${item.place} ${item.category} ${item.details}`.toLowerCase();
    const matchesText = normalizedQuery.split(/\s+/).filter(Boolean).every((term) => searchableText.includes(term));
    const matchesInterest = interest === 'All interests' || item.category.toLowerCase().includes(interest.toLowerCase());
    const matchesDistrict = district === 'All districts' || item.place.toLowerCase().includes(district.toLowerCase());
    return matchesText && matchesInterest && matchesDistrict;
  }), [normalizedQuery, interest, district]);

  const hasFilters = normalizedQuery || interest !== 'All interests' || district !== 'All districts';
  const visibleAttractions = hasFilters
    ? filteredAttractions
    : showAllAttractions ? attractions : attractions.slice(0, 5);

  useEffect(() => {
    const targetId = location.state?.scrollTo;
    if (!targetId) return;
    requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [location.state?.scrollTo]);

  return (
    <main id="main-content" className="tourism-app">
      <Header />

      {/* HERO */}
      <section className="hero-section">
        <div className="hero">
          <img fetchPriority="high" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }}
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80"
            alt="Jharkhand forest"
          />

          <div className="hero__overlay" />

          <div className="hero__content">
            <h1>Discover the beauty of Jharkhand</h1>

            <p>
              Experience breathtaking landscapes and culture.
            </p>
          </div>
        </div>

        <div className="search-panel" role="search">
          <div className="search-panel__topline"><div><span className="search-panel__eyebrow">Find your next stop</span><p>Search waterfalls, temples and more</p></div>{hasFilters && <button className="search-reset" type="button" onClick={() => { setQuery(''); setInterest('All interests'); setDistrict('All districts'); }}>Clear filters</button>}</div>
          <div className="search-controls">
            <label className="search-field search-field--query"><span className="search-field__icon" aria-hidden="true">⌕</span><span className="sr-only">Search places</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “waterfalls” or “Ranchi”" autoComplete="off" /></label>
            <label className="search-field"><span className="search-field__label">Experience</span><select value={interest} onChange={(event) => setInterest(event.target.value)}><option>All interests</option><option>Waterfall</option><option>Nature</option><option>Lake</option><option>Heritage</option><option>Wildlife</option><option>Religious</option></select></label>
            <label className="search-field"><span className="search-field__label">Area</span><select value={district} onChange={(event) => setDistrict(event.target.value)}><option>All districts</option>{[...new Set(attractions.map((item) => item.place))].sort().map((place) => <option key={place}>{place}</option>)}</select></label>
            <button className="search-button" type="button" onClick={() => document.getElementById('attractions')?.scrollIntoView({ behavior: 'smooth' })}>Search <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section
        id="destinations"
        className="content-section"
      >
        <h2>Top destinations</h2>

        <div className="destination-grid">
          {destinations.map((destination) => (
            <Link
              className="destination-card"
              to={`/destinations/${slug(destination.name)}`}
              key={destination.name}
            >
              <img loading="lazy" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }}
                src={destination.image}
                alt={destination.name}
              />

              <div className="destination-card__shade" />

              <span>{destination.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ATTRACTIONS */}
      <section
        id="attractions"
        className="content-section"
      >
        <h2>{hasFilters ? 'Matching places' : 'Places to explore'}</h2>
        {hasFilters && <p className="search-results-count" aria-live="polite">{filteredAttractions.length} {filteredAttractions.length === 1 ? 'place' : 'places'} found</p>}

        <div className="attraction-grid">
          {visibleAttractions.map((attraction) => (
            <article
              className="attraction-card"
              key={attraction.name}
            >
              <div className="attraction-card__image">
                <img loading="lazy" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }}
                  src={attraction.image}
                  alt={attraction.name}
                />

              </div>

              <div className="attraction-card__body">
                <h3>{attraction.name}</h3>

                <p>{attraction.place}</p>

                <span className="attraction-category">
                  {attraction.category}
                </span>

                <Link
                  to={`/attractions/${slug(
                    attraction.name
                  )}`}
                >
                  Explore →
                </Link>
              </div>
            </article>
          ))}
        </div>
        {visibleAttractions.length === 0 && <p className="empty-state">No places match those filters. Try another district or interest.</p>}

        {!hasFilters && attractions.length > 5 && (
          <div className="show-more-wrap">
            {!showAllAttractions ? (
              <button
                className="show-more-button"
                onClick={() =>
                  setShowAllAttractions(true)
                }
              >
                Show more
              </button>
            ) : (
              <button
                className="show-more-button"
                onClick={() => {
                  setShowAllAttractions(false);

                  document
                    .getElementById('attractions')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                }}
              >
                Show less
              </button>
            )}
          </div>
        )}
      </section>

      {/* STATE GUIDE */}
      <section
        id="state-guide"
        className="content-section state-guide"
      >
        <div className="state-guide__heading">
          <div>
            <p className="eyebrow">Know your state</p>

            <h2>Jharkhand at a glance</h2>

            <p>
              Jharkhand is an eastern Indian state known for
              waterfalls, sacred sites, forest landscapes and
              vibrant tribal heritage.
            </p>
          </div>

          <div className="state-facts">
            <span>
              <strong>Capital</strong>
              Ranchi
            </span>

            <span>
              <strong>Districts</strong>
              24
            </span>

            <span>
              <strong>Divisions</strong>
              5
            </span>

            <span>
              <strong>Statehood</strong>
              15 Nov 2000
            </span>
          </div>
        </div>

        <div className="leaders-grid">
          <article>
            <p className="eyebrow">Places to know</p>

            <h3>Waterfalls, hills & heritage</h3>

            <p>
              Visit Baidyanath Dham, Parasnath, Rajrappa,
              Netarhat and the waterfalls around Ranchi.
            </p>
          </article>
        </div>

        <h3 className="state-guide__subhead">
          All districts
        </h3>

        <div className="district-list">
          {districts.map((district) => (
            <span key={district}>{district}</span>
          ))}
        </div>

        <p className="state-guide__note">For current government services, permits and official travel advisories, use the relevant Jharkhand government department or destination authority.</p>
      </section>

      {/* LOCAL PRODUCTS */}
      <section
        id="local-products"
        className="content-section"
      >
        <div className="local-products__heading">
          <p className="eyebrow">Bring a piece of Jharkhand home</p>

          <h2>Local crafts & products</h2>

          <p>
            Handmade by tribal artisans across the state, each piece
            carries generations of craft, tradition and story.
          </p>
        </div>

        <div className="local-products-grid">
          {localProducts.map((product) => (
            <article
              className="local-product-card"
              key={product.name}
            >
              <div className="local-product-card__image">
                <img loading="lazy" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} src={product.image} alt={product.name} />
              </div>

              <div className="local-product-card__body">
                <h3>{product.name}</h3>

                <span className="local-product-card__origin">
                  📍 {product.origin}
                </span>

                <p>{product.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* COMMUNITY */}
      <section
        id="community"
        className="content-section community-section"
      >
        <div>
          <p className="community-section__title">
            Pssst!
          </p>

          <p>
            Want trip-planning updates and local stories?
            Newsletter signup is coming soon.
          </p>
        </div>

        <span className="info-note">Email updates are coming soon.</span>
      </section>
      <SiteFooter />
    </main>
  );
}

/* =========================================================
   SLUG FUNCTION
========================================================= */

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function TripPlanPage() {
  const { user, status: authStatus } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    if (authStatus !== 'authenticated') return;
    setLoading(true);
    try {
      const { trips } = await apiRequest('/trips');
      setItems(trips);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load your trips.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') refresh();
    else {
      setItems([]);
      setLoading(authStatus === 'loading');
    }
  }, [authStatus, user?.id]);

  useEffect(() => {
    const update = () => refresh();
    window.addEventListener('trip-plan-updated', update);
    return () => window.removeEventListener('trip-plan-updated', update);
  }, [authStatus, user?.id]);

  const updateTrip = async (item, updates) => {
    try {
      await apiRequest(`/trips/${item.id}`, { method: 'PUT', body: JSON.stringify(updates) });
      await refresh();
      window.dispatchEvent(new Event('trip-plan-updated'));
    } catch (requestError) {
      setError(requestError.message || 'Could not update your trip.');
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setItems(updated);
    try {
      await Promise.all(updated.map((item, position) => apiRequest(`/trips/${item.id}`, {
        method: 'PUT', body: JSON.stringify({ position }),
      })));
      window.dispatchEvent(new Event('trip-plan-updated'));
    } catch (requestError) {
      setError(requestError.message || 'Could not reorder your trip.');
      refresh();
    }
  };
  const share = async () => {
    const message = `My Jharkhand trip: ${items.map((item, index) => `${index + 1}. Day ${item.day || 1}: ${item.name}${item.place ? ` (${item.place})` : ''}`).join('; ')}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My Jharkhand trip', text: message });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(message); window.alert('Trip copied to clipboard.'); }
      else window.alert(message);
    } catch (error) {
      if (error.name !== 'AbortError') window.alert('Unable to share this trip from your browser.');
    }
  };

  return <main id="main-content" className="tourism-app"><Header /><section className="article-page trip-page"><p className="eyebrow">Plan your visit</p><h1>My Jharkhand trip</h1><p className="page-intro">Your saved places are private to your account and stay available when you sign in again.</p>
    {authStatus === 'loading' || loading ? <p role="status">Loading your saved trips…</p>
      : authStatus !== 'authenticated' ? <div className="empty-state"><p>Sign in to view and manage your personal trip list.</p><button className="button button--orange" onClick={() => navigate('/login', { state: { from: '/trip-plan' } })}>Log in or create account</button></div>
        : error ? <div className="auth-status-error" role="alert"><p>{error}</p><button className="button button--dark" onClick={refresh}>Try again</button></div>
          : items.length ? <><ol className="trip-list">{items.map((item, index) => <li key={item.id}><span className="trip-list__number">{index + 1}</span><div className="trip-list__info"><strong>{item.name}</strong><span>{item.place || item.type}</span></div><label className="trip-day">Day <select aria-label={`Assign ${item.name} to a day`} value={item.day || 1} onChange={(event) => updateTrip(item, { day: Number(event.target.value) })}>{[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{day}</option>)}</select></label><Link className="trip-list__link" to={item.path}>Details</Link><button onClick={() => move(index, -1)} aria-label={`Move ${item.name} up`} disabled={index === 0}>↑</button><button onClick={() => move(index, 1)} aria-label={`Move ${item.name} down`} disabled={index === items.length - 1}>↓</button><button onClick={async () => { try { await apiRequest(`/trips/${item.id}`, { method: 'DELETE' }); await refresh(); window.dispatchEvent(new Event('trip-plan-updated')); } catch (requestError) { setError(requestError.message || 'Could not remove this place.'); } }}>Remove</button></li>)}</ol><div className="trip-actions"><button className="button button--orange" onClick={share}>Share trip</button><button className="button button--dark" onClick={async () => { try { await apiRequest('/trips', { method: 'DELETE' }); setItems([]); window.dispatchEvent(new Event('trip-plan-updated')); } catch (requestError) { setError(requestError.message || 'Could not clear your trip.'); } }}>Clear trip</button></div></> : <div className="empty-state"><p>Your trip list is empty.</p><Link className="button button--orange" to="/" state={{ scrollTo: 'destinations' }}>Explore destinations</Link></div>}
  </section><SiteFooter /></main>;
}

/* =========================================================
   APP
========================================================= */

export default function JharkhandTourism() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<LoginPage accountOnly />} />
          <Route path="/trip-plan" element={<TripPlanPage />} />

          <Route
            path="/explore"
            element={<ExplorePage />}
          />

          {destinations.map((destination) => (
            <Route
              key={destination.name}
              path={`/destinations/${slug(destination.name)}`}
              element={<DetailPage item={destination} kind="destination" />}
            />
          ))}

          {attractions.map((attraction) => (
            <Route
              key={attraction.name}
              path={`/attractions/${slug(attraction.name)}`}
              element={<DetailPage item={attraction} kind="attraction" />}
            />
          ))}

          {articles.map((article) => (
            <Route
              key={article.title}
              path={`/articles/${slug(article.title)}`}
              element={<DetailPage item={article} kind="article" />}
            />
          ))}
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
