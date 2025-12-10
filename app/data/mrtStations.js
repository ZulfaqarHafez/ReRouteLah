// Singapore MRT Stations with coordinates and line information
// Lines: NSL (North-South), EWL (East-West), NEL (North-East), CCL (Circle), DTL (Downtown), TEL (Thomson-East Coast)

export const mrtStations = [
  // North-South Line (NSL) - Red
  { code: "NS1", name: "Jurong East", lat: 1.333152, lng: 103.742286, lines: ["NSL", "EWL"], interchange: true },
  { code: "NS2", name: "Bukit Batok", lat: 1.349033, lng: 103.749566, lines: ["NSL"] },
  { code: "NS3", name: "Bukit Gombak", lat: 1.358611, lng: 103.751790, lines: ["NSL"] },
  { code: "NS4", name: "Choa Chu Kang", lat: 1.385363, lng: 103.744370, lines: ["NSL"] },
  { code: "NS5", name: "Yew Tee", lat: 1.397535, lng: 103.747405, lines: ["NSL"] },
  { code: "NS7", name: "Kranji", lat: 1.425086, lng: 103.762137, lines: ["NSL"] },
  { code: "NS8", name: "Marsiling", lat: 1.432521, lng: 103.774074, lines: ["NSL"] },
  { code: "NS9", name: "Woodlands", lat: 1.436819, lng: 103.786066, lines: ["NSL", "TEL"], interchange: true },
  { code: "NS10", name: "Admiralty", lat: 1.440588, lng: 103.800990, lines: ["NSL"] },
  { code: "NS11", name: "Sembawang", lat: 1.449009, lng: 103.820040, lines: ["NSL"] },
  { code: "NS12", name: "Canberra", lat: 1.443076, lng: 103.829702, lines: ["NSL"] },
  { code: "NS13", name: "Yishun", lat: 1.429443, lng: 103.835005, lines: ["NSL"] },
  { code: "NS14", name: "Khatib", lat: 1.417383, lng: 103.832979, lines: ["NSL"] },
  { code: "NS15", name: "Yio Chu Kang", lat: 1.381755, lng: 103.844947, lines: ["NSL"] },
  { code: "NS16", name: "Ang Mo Kio", lat: 1.369932, lng: 103.849558, lines: ["NSL"] },
  { code: "NS17", name: "Bishan", lat: 1.350898, lng: 103.848126, lines: ["NSL", "CCL"], interchange: true },
  { code: "NS18", name: "Braddell", lat: 1.340469, lng: 103.846799, lines: ["NSL"] },
  { code: "NS19", name: "Toa Payoh", lat: 1.332629, lng: 103.847502, lines: ["NSL"] },
  { code: "NS20", name: "Novena", lat: 1.320458, lng: 103.843842, lines: ["NSL"] },
  { code: "NS21", name: "Newton", lat: 1.312318, lng: 103.837984, lines: ["NSL", "DTL"], interchange: true },
  { code: "NS22", name: "Orchard", lat: 1.303980, lng: 103.832245, lines: ["NSL", "TEL"], interchange: true },
  { code: "NS23", name: "Somerset", lat: 1.300264, lng: 103.839085, lines: ["NSL"] },
  { code: "NS24", name: "Dhoby Ghaut", lat: 1.298701, lng: 103.846113, lines: ["NSL", "NEL", "CCL"], interchange: true },
  { code: "NS25", name: "City Hall", lat: 1.292936, lng: 103.852585, lines: ["NSL", "EWL"], interchange: true },
  { code: "NS26", name: "Raffles Place", lat: 1.283933, lng: 103.851463, lines: ["NSL", "EWL"], interchange: true },
  { code: "NS27", name: "Marina Bay", lat: 1.276410, lng: 103.854595, lines: ["NSL", "CCL", "TEL"], interchange: true },
  { code: "NS28", name: "Marina South Pier", lat: 1.271027, lng: 103.862447, lines: ["NSL"] },

  // East-West Line (EWL) - Green
  { code: "EW1", name: "Pasir Ris", lat: 1.373062, lng: 103.949340, lines: ["EWL"] },
  { code: "EW2", name: "Tampines", lat: 1.352618, lng: 103.945145, lines: ["EWL", "DTL"], interchange: true },
  { code: "EW3", name: "Simei", lat: 1.343285, lng: 103.953301, lines: ["EWL"] },
  { code: "EW4", name: "Tanah Merah", lat: 1.327187, lng: 103.946348, lines: ["EWL"] },
  { code: "EW5", name: "Bedok", lat: 1.323988, lng: 103.930050, lines: ["EWL"] },
  { code: "EW6", name: "Kembangan", lat: 1.321038, lng: 103.912947, lines: ["EWL"] },
  { code: "EW7", name: "Eunos", lat: 1.319783, lng: 103.903225, lines: ["EWL"] },
  { code: "EW8", name: "Paya Lebar", lat: 1.318111, lng: 103.893060, lines: ["EWL", "CCL"], interchange: true },
  { code: "EW9", name: "Aljunied", lat: 1.316432, lng: 103.882906, lines: ["EWL"] },
  { code: "EW10", name: "Kallang", lat: 1.311488, lng: 103.871386, lines: ["EWL"] },
  { code: "EW11", name: "Lavender", lat: 1.307377, lng: 103.862767, lines: ["EWL"] },
  { code: "EW12", name: "Bugis", lat: 1.300465, lng: 103.855706, lines: ["EWL", "DTL"], interchange: true },
  { code: "EW13", name: "City Hall", lat: 1.292936, lng: 103.852585, lines: ["NSL", "EWL"], interchange: true },
  { code: "EW14", name: "Raffles Place", lat: 1.283933, lng: 103.851463, lines: ["NSL", "EWL"], interchange: true },
  { code: "EW15", name: "Tanjong Pagar", lat: 1.276561, lng: 103.845725, lines: ["EWL"] },
  { code: "EW16", name: "Outram Park", lat: 1.279720, lng: 103.839439, lines: ["EWL", "NEL", "TEL"], interchange: true },
  { code: "EW17", name: "Tiong Bahru", lat: 1.286102, lng: 103.827445, lines: ["EWL"] },
  { code: "EW18", name: "Redhill", lat: 1.289634, lng: 103.816740, lines: ["EWL"] },
  { code: "EW19", name: "Queenstown", lat: 1.294193, lng: 103.806100, lines: ["EWL"] },
  { code: "EW20", name: "Commonwealth", lat: 1.302501, lng: 103.798228, lines: ["EWL"] },
  { code: "EW21", name: "Buona Vista", lat: 1.307223, lng: 103.790253, lines: ["EWL", "CCL"], interchange: true },
  { code: "EW22", name: "Dover", lat: 1.311405, lng: 103.778637, lines: ["EWL"] },
  { code: "EW23", name: "Clementi", lat: 1.315116, lng: 103.765191, lines: ["EWL"] },
  { code: "EW24", name: "Jurong East", lat: 1.333152, lng: 103.742286, lines: ["NSL", "EWL"], interchange: true },
  { code: "EW25", name: "Chinese Garden", lat: 1.342352, lng: 103.732596, lines: ["EWL"] },
  { code: "EW26", name: "Lakeside", lat: 1.344259, lng: 103.720949, lines: ["EWL"] },
  { code: "EW27", name: "Boon Lay", lat: 1.338604, lng: 103.706064, lines: ["EWL"] },
  { code: "EW28", name: "Pioneer", lat: 1.337587, lng: 103.697321, lines: ["EWL"] },
  { code: "EW29", name: "Joo Koon", lat: 1.327717, lng: 103.678374, lines: ["EWL"] },
  { code: "EW30", name: "Gul Circle", lat: 1.319470, lng: 103.660530, lines: ["EWL"] },
  { code: "EW31", name: "Tuas Crescent", lat: 1.321026, lng: 103.649078, lines: ["EWL"] },
  { code: "EW32", name: "Tuas West Road", lat: 1.329985, lng: 103.639616, lines: ["EWL"] },
  { code: "EW33", name: "Tuas Link", lat: 1.340882, lng: 103.636991, lines: ["EWL"] },

  // North-East Line (NEL) - Purple
  { code: "NE1", name: "HarbourFront", lat: 1.265389, lng: 103.821530, lines: ["NEL", "CCL"], interchange: true },
  { code: "NE3", name: "Outram Park", lat: 1.279720, lng: 103.839439, lines: ["EWL", "NEL", "TEL"], interchange: true },
  { code: "NE4", name: "Chinatown", lat: 1.284359, lng: 103.843426, lines: ["NEL", "DTL"], interchange: true },
  { code: "NE5", name: "Clarke Quay", lat: 1.288710, lng: 103.846610, lines: ["NEL"] },
  { code: "NE6", name: "Dhoby Ghaut", lat: 1.298701, lng: 103.846113, lines: ["NSL", "NEL", "CCL"], interchange: true },
  { code: "NE7", name: "Little India", lat: 1.306566, lng: 103.849557, lines: ["NEL", "DTL"], interchange: true },
  { code: "NE8", name: "Farrer Park", lat: 1.312302, lng: 103.854772, lines: ["NEL"] },
  { code: "NE9", name: "Boon Keng", lat: 1.319616, lng: 103.861722, lines: ["NEL"] },
  { code: "NE10", name: "Potong Pasir", lat: 1.331379, lng: 103.869055, lines: ["NEL"] },
  { code: "NE11", name: "Woodleigh", lat: 1.339181, lng: 103.870744, lines: ["NEL"] },
  { code: "NE12", name: "Serangoon", lat: 1.349728, lng: 103.873566, lines: ["NEL", "CCL"], interchange: true },
  { code: "NE13", name: "Kovan", lat: 1.360144, lng: 103.884903, lines: ["NEL"] },
  { code: "NE14", name: "Hougang", lat: 1.371198, lng: 103.892178, lines: ["NEL"] },
  { code: "NE15", name: "Buangkok", lat: 1.382870, lng: 103.893122, lines: ["NEL"] },
  { code: "NE16", name: "Sengkang", lat: 1.391693, lng: 103.895484, lines: ["NEL"] },
  { code: "NE17", name: "Punggol", lat: 1.405194, lng: 103.902411, lines: ["NEL"] },

  // Circle Line (CCL) - Orange/Yellow
  { code: "CC1", name: "Dhoby Ghaut", lat: 1.298701, lng: 103.846113, lines: ["NSL", "NEL", "CCL"], interchange: true },
  { code: "CC2", name: "Bras Basah", lat: 1.296861, lng: 103.850667, lines: ["CCL"] },
  { code: "CC3", name: "Esplanade", lat: 1.293657, lng: 103.855081, lines: ["CCL"] },
  { code: "CC4", name: "Promenade", lat: 1.293997, lng: 103.860350, lines: ["CCL", "DTL"], interchange: true },
  { code: "CC5", name: "Nicoll Highway", lat: 1.299766, lng: 103.863636, lines: ["CCL"] },
  { code: "CC6", name: "Stadium", lat: 1.302812, lng: 103.875337, lines: ["CCL"] },
  { code: "CC7", name: "Mountbatten", lat: 1.306172, lng: 103.882429, lines: ["CCL"] },
  { code: "CC8", name: "Dakota", lat: 1.308337, lng: 103.888614, lines: ["CCL"] },
  { code: "CC9", name: "Paya Lebar", lat: 1.318111, lng: 103.893060, lines: ["EWL", "CCL"], interchange: true },
  { code: "CC10", name: "MacPherson", lat: 1.326077, lng: 103.890391, lines: ["CCL", "DTL"], interchange: true },
  { code: "CC11", name: "Tai Seng", lat: 1.335141, lng: 103.888389, lines: ["CCL"] },
  { code: "CC12", name: "Bartley", lat: 1.342501, lng: 103.880177, lines: ["CCL"] },
  { code: "CC13", name: "Serangoon", lat: 1.349728, lng: 103.873566, lines: ["NEL", "CCL"], interchange: true },
  { code: "CC14", name: "Lorong Chuan", lat: 1.351636, lng: 103.864080, lines: ["CCL"] },
  { code: "CC15", name: "Bishan", lat: 1.350898, lng: 103.848126, lines: ["NSL", "CCL"], interchange: true },
  { code: "CC16", name: "Marymount", lat: 1.348707, lng: 103.839423, lines: ["CCL"] },
  { code: "CC17", name: "Caldecott", lat: 1.337761, lng: 103.839699, lines: ["CCL", "TEL"], interchange: true },
  { code: "CC19", name: "Botanic Gardens", lat: 1.322519, lng: 103.815105, lines: ["CCL", "DTL"], interchange: true },
  { code: "CC20", name: "Farrer Road", lat: 1.317319, lng: 103.807598, lines: ["CCL"] },
  { code: "CC21", name: "Holland Village", lat: 1.312175, lng: 103.796134, lines: ["CCL"] },
  { code: "CC22", name: "Buona Vista", lat: 1.307223, lng: 103.790253, lines: ["EWL", "CCL"], interchange: true },
  { code: "CC23", name: "one-north", lat: 1.299471, lng: 103.787264, lines: ["CCL"] },
  { code: "CC24", name: "Kent Ridge", lat: 1.293554, lng: 103.784637, lines: ["CCL"] },
  { code: "CC25", name: "Haw Par Villa", lat: 1.282634, lng: 103.781983, lines: ["CCL"] },
  { code: "CC26", name: "Pasir Panjang", lat: 1.276167, lng: 103.791350, lines: ["CCL"] },
  { code: "CC27", name: "Labrador Park", lat: 1.272267, lng: 103.802946, lines: ["CCL"] },
  { code: "CC28", name: "Telok Blangah", lat: 1.270651, lng: 103.809820, lines: ["CCL"] },
  { code: "CC29", name: "HarbourFront", lat: 1.265389, lng: 103.821530, lines: ["NEL", "CCL"], interchange: true },

  // Downtown Line (DTL) - Blue
  { code: "DT1", name: "Bukit Panjang", lat: 1.379002, lng: 103.761535, lines: ["DTL"] },
  { code: "DT2", name: "Cashew", lat: 1.369079, lng: 103.764454, lines: ["DTL"] },
  { code: "DT3", name: "Hillview", lat: 1.362344, lng: 103.767418, lines: ["DTL"] },
  { code: "DT5", name: "Beauty World", lat: 1.341223, lng: 103.775794, lines: ["DTL"] },
  { code: "DT6", name: "King Albert Park", lat: 1.335514, lng: 103.783138, lines: ["DTL"] },
  { code: "DT7", name: "Sixth Avenue", lat: 1.330604, lng: 103.796987, lines: ["DTL"] },
  { code: "DT8", name: "Tan Kah Kee", lat: 1.325983, lng: 103.807675, lines: ["DTL"] },
  { code: "DT9", name: "Botanic Gardens", lat: 1.322519, lng: 103.815105, lines: ["CCL", "DTL"], interchange: true },
  { code: "DT10", name: "Stevens", lat: 1.320076, lng: 103.826048, lines: ["DTL", "TEL"], interchange: true },
  { code: "DT11", name: "Newton", lat: 1.312318, lng: 103.837984, lines: ["NSL", "DTL"], interchange: true },
  { code: "DT12", name: "Little India", lat: 1.306566, lng: 103.849557, lines: ["NEL", "DTL"], interchange: true },
  { code: "DT13", name: "Rochor", lat: 1.303702, lng: 103.852581, lines: ["DTL"] },
  { code: "DT14", name: "Bugis", lat: 1.300465, lng: 103.855706, lines: ["EWL", "DTL"], interchange: true },
  { code: "DT15", name: "Promenade", lat: 1.293997, lng: 103.860350, lines: ["CCL", "DTL"], interchange: true },
  { code: "DT16", name: "Bayfront", lat: 1.281873, lng: 103.859079, lines: ["DTL", "CCL"], interchange: true },
  { code: "DT17", name: "Downtown", lat: 1.279446, lng: 103.852840, lines: ["DTL"] },
  { code: "DT18", name: "Telok Ayer", lat: 1.282068, lng: 103.848648, lines: ["DTL"] },
  { code: "DT19", name: "Chinatown", lat: 1.284359, lng: 103.843426, lines: ["NEL", "DTL"], interchange: true },
  { code: "DT20", name: "Fort Canning", lat: 1.292392, lng: 103.844352, lines: ["DTL"] },
  { code: "DT21", name: "Bencoolen", lat: 1.298490, lng: 103.850025, lines: ["DTL"] },
  { code: "DT22", name: "Jalan Besar", lat: 1.305448, lng: 103.855534, lines: ["DTL"] },
  { code: "DT23", name: "Bendemeer", lat: 1.313766, lng: 103.863039, lines: ["DTL"] },
  { code: "DT24", name: "Geylang Bahru", lat: 1.321418, lng: 103.871596, lines: ["DTL"] },
  { code: "DT25", name: "Mattar", lat: 1.326691, lng: 103.883108, lines: ["DTL"] },
  { code: "DT26", name: "MacPherson", lat: 1.326077, lng: 103.890391, lines: ["CCL", "DTL"], interchange: true },
  { code: "DT27", name: "Ubi", lat: 1.329956, lng: 103.899179, lines: ["DTL"] },
  { code: "DT28", name: "Kaki Bukit", lat: 1.334955, lng: 103.908594, lines: ["DTL"] },
  { code: "DT29", name: "Bedok North", lat: 1.334797, lng: 103.918126, lines: ["DTL"] },
  { code: "DT30", name: "Bedok Reservoir", lat: 1.336570, lng: 103.932066, lines: ["DTL"] },
  { code: "DT31", name: "Tampines West", lat: 1.345303, lng: 103.938524, lines: ["DTL"] },
  { code: "DT32", name: "Tampines", lat: 1.352618, lng: 103.945145, lines: ["EWL", "DTL"], interchange: true },
  { code: "DT33", name: "Tampines East", lat: 1.356151, lng: 103.954613, lines: ["DTL"] },
  { code: "DT34", name: "Upper Changi", lat: 1.341421, lng: 103.961348, lines: ["DTL"] },
  { code: "DT35", name: "Expo", lat: 1.335382, lng: 103.962374, lines: ["DTL", "CGL"], interchange: true },

  // Thomson-East Coast Line (TEL) - Brown
  { code: "TE1", name: "Woodlands North", lat: 1.448684, lng: 103.785272, lines: ["TEL"] },
  { code: "TE2", name: "Woodlands", lat: 1.436819, lng: 103.786066, lines: ["NSL", "TEL"], interchange: true },
  { code: "TE3", name: "Woodlands South", lat: 1.427615, lng: 103.793095, lines: ["TEL"] },
  { code: "TE4", name: "Springleaf", lat: 1.397298, lng: 103.818795, lines: ["TEL"] },
  { code: "TE5", name: "Lentor", lat: 1.386701, lng: 103.836282, lines: ["TEL"] },
  { code: "TE6", name: "Mayflower", lat: 1.373590, lng: 103.838225, lines: ["TEL"] },
  { code: "TE7", name: "Bright Hill", lat: 1.363399, lng: 103.833569, lines: ["TEL"] },
  { code: "TE8", name: "Upper Thomson", lat: 1.354220, lng: 103.833131, lines: ["TEL"] },
  { code: "TE9", name: "Caldecott", lat: 1.337761, lng: 103.839699, lines: ["CCL", "TEL"], interchange: true },
  { code: "TE11", name: "Stevens", lat: 1.320076, lng: 103.826048, lines: ["DTL", "TEL"], interchange: true },
  { code: "TE12", name: "Napier", lat: 1.306786, lng: 103.817995, lines: ["TEL"] },
  { code: "TE13", name: "Orchard Boulevard", lat: 1.302197, lng: 103.828001, lines: ["TEL"] },
  { code: "TE14", name: "Orchard", lat: 1.303980, lng: 103.832245, lines: ["NSL", "TEL"], interchange: true },
  { code: "TE15", name: "Great World", lat: 1.293365, lng: 103.831650, lines: ["TEL"] },
  { code: "TE16", name: "Havelock", lat: 1.288540, lng: 103.835340, lines: ["TEL"] },
  { code: "TE17", name: "Outram Park", lat: 1.279720, lng: 103.839439, lines: ["EWL", "NEL", "TEL"], interchange: true },
  { code: "TE18", name: "Maxwell", lat: 1.280533, lng: 103.843883, lines: ["TEL"] },
  { code: "TE19", name: "Shenton Way", lat: 1.277716, lng: 103.850367, lines: ["TEL"] },
  { code: "TE20", name: "Marina Bay", lat: 1.276410, lng: 103.854595, lines: ["NSL", "CCL", "TEL"], interchange: true },
  { code: "TE21", name: "Marina South", lat: 1.270872, lng: 103.862938, lines: ["TEL"] },
  { code: "TE22", name: "Gardens by the Bay", lat: 1.278487, lng: 103.867454, lines: ["TEL"] },
  { code: "TE23", name: "Tanjong Rhu", lat: 1.297265, lng: 103.873453, lines: ["TEL"] },
  { code: "TE24", name: "Katong Park", lat: 1.297831, lng: 103.886178, lines: ["TEL"] },
  { code: "TE25", name: "Tanjong Katong", lat: 1.304967, lng: 103.894820, lines: ["TEL"] },
  { code: "TE26", name: "Marine Parade", lat: 1.302611, lng: 103.904983, lines: ["TEL"] },
  { code: "TE27", name: "Marine Terrace", lat: 1.306648, lng: 103.913453, lines: ["TEL"] },
  { code: "TE28", name: "Siglap", lat: 1.310008, lng: 103.930025, lines: ["TEL"] },
  { code: "TE29", name: "Bayshore", lat: 1.316352, lng: 103.943516, lines: ["TEL"] },
];

// Line colors for UI display
export const lineColors = {
  NSL: { name: "North-South Line", color: "#D42E12", bgColor: "bg-red-600" },
  EWL: { name: "East-West Line", color: "#009645", bgColor: "bg-green-600" },
  NEL: { name: "North-East Line", color: "#9900AA", bgColor: "bg-purple-600" },
  CCL: { name: "Circle Line", color: "#FA9E0D", bgColor: "bg-orange-500" },
  DTL: { name: "Downtown Line", color: "#005EC4", bgColor: "bg-blue-600" },
  TEL: { name: "Thomson-East Coast Line", color: "#9D5B25", bgColor: "bg-amber-700" },
  CGL: { name: "Changi Airport Branch", color: "#009645", bgColor: "bg-green-600" },
};

// Helper function to find nearest MRT station
export function findNearestStation(lat, lng, maxDistanceKm = 2) {
  let nearest = null;
  let minDistance = Infinity;

  for (const station of mrtStations) {
    const distance = haversineDistance(lat, lng, station.lat, station.lng);
    if (distance < minDistance && distance <= maxDistanceKm) {
      minDistance = distance;
      nearest = { ...station, distance };
    }
  }

  return nearest;
}

// Helper function to find stations within radius
export function findStationsInRadius(lat, lng, radiusKm = 1) {
  return mrtStations
    .map(station => ({
      ...station,
      distance: haversineDistance(lat, lng, station.lat, station.lng)
    }))
    .filter(station => station.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

// Haversine formula for distance calculation
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}
