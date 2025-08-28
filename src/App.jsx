// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Route, Languages, LocateFixed, ExternalLink } from "lucide-react";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const UI = {
  ko: {
    title: "케데헌 따라 서울 여행 맵",
    subtitle: "<케이팝 데몬 헌터스>에 나온 서울 배경지를 따라가며 여행하는 웹앱",
    search: "장소 검색",
    category: "카테고리",
    all: "전체",
    buildRoute: "지도 앱으로 경로 열기",
    followRouteHint: "필터/정렬된 순서대로 최대 10곳까지 길찾기를 엽니다. (Google Maps)",
    details: "자세히",
    directions: "길찾기",
    nearMe: "내 위치로",
    langLabel: "언어",
    sourceTag: "케데헌 배경",
    empty: "검색 조건에 맞는 장소가 없습니다.",
  },
  en: {
    title: "Seoul by Kedeheon — Bilingual Map",
    subtitle: "A travel map that follows Seoul locations featured in ‘K-Pop Demon Hunters’.",
    search: "Search places",
    category: "Category",
    all: "All",
    buildRoute: "Open route in map app",
    followRouteHint: "Opens Google Maps directions for up to 10 places in the current order.",
    details: "Details",
    directions: "Directions",
    nearMe: "Center on me",
    langLabel: "Language",
    sourceTag: "Kedeheon location",
    empty: "No places match your filters.",
  },
};

const PLACES = [
  { id: "bukchon", name: { ko: "북촌한옥마을", en: "Bukchon Hanok Village" }, category: "traditional", lat: 37.5826, lng: 126.983, address: "서울 종로구 계동길 37", summary: { ko: "도입부/배경에 자주 등장하는 전통 한옥 골목.", en: "Traditional hanok alleys frequently seen in opening/background shots." }},
  { id: "nseoul", name: { ko: "N서울타워", en: "N Seoul Tower" }, category: "landmark", lat: 37.5512, lng: 126.9882, address: "서울 용산구 남산공원길 105", summary: { ko: "서울의 상징적 야경 포인트.", en: "Iconic night view landmark of Seoul." }},
  { id: "coex", name: { ko: "코엑스 3D 스크린", en: "COEX 3D Wave Screen (K-pop Square)" }, category: "digital", lat: 37.5112, lng: 127.0592, address: "서울 강남구 영동대로 511", summary: { ko: "거대한 3D 파도 화면으로 유명한 스폿.", en: "Famous for the giant 3D ‘wave’ screen." }},
  { id: "jamsil-hangang", name: { ko: "잠실 한강공원 야경", en: "Jamsil Hangang Park Night View" }, category: "river", lat: 37.5164, lng: 127.0735, address: "서울 송파구 한가람로 65", summary: { ko: "한강 야경과 도심 스카이라인이 펼쳐지는 장소.", en: "Night vistas over the Han River and Seoul skyline." }},
  { id: "naksan", name: { ko: "낙산공원", en: "Naksan Park" }, category: "park", lat: 37.579, lng: 127.007, address: "서울 종로구 낙산길 41", summary: { ko: "성곽길과 함께 서울 도심이 시원하게 보이는 공원.", en: "City panoramas along Seoul Fortress Wall trails." }},
  { id: "cheongdam-bridge", name: { ko: "청담대교 지하철 구간", en: "Cheongdam Bridge Subway Section" }, category: "bridge", lat: 37.526, lng: 127.047, address: "강남구↔광진구", summary: { ko: "한강 위를 달리는 지하철 장면의 배경.", en: "Subway run over the Han river in the film." }},
  { id: "myeongdong", name: { ko: "명동거리", en: "Myeongdong Street" }, category: "shopping", lat: 37.5637, lng: 126.9852, address: "서울 중구 명동길 일대", summary: { ko: "네온 사인과 인파로 가득한 메인 스트리트.", en: "Neon-lit main shopping drag crowded with visitors." }},
  { id: "olympic-main", name: { ko: "서울올림픽주경기장", en: "Seoul Olympic Main Stadium" }, category: "stadium", lat: 37.515, lng: 127.073, address: "서울 송파구 올림픽로 25", summary: { ko: "공연·액션 전개가 어울리는 대형 경기장.", en: "Grand venue fit for performance and action set-pieces." }},
  { id: "lotte-tower", name: { ko: "롯데월드타워", en: "Lotte World Tower" }, category: "landmark", lat: 37.5133, lng: 127.1028, address: "서울 송파구 올림픽로 300", summary: { ko: "123층 초고층 타워. 전망대 시그니처 뷰.", en: "123-story supertall with a signature observatory view." }},
  { id: "jayang", name: { ko: "자양역(구 뚝섬유원지)", en: "Jayang Station (ex-Ttukseom Resort)" }, category: "subway", lat: 37.5352, lng: 127.0847, address: "서울 광진구 능동로 10", summary: { ko: "뚝섬 일대 장면의 거점.", en: "Anchor for scenes around Ttukseom area." }},
];

const CATEGORIES = [
  { key: "all", label: { ko: UI.ko.all, en: UI.en.all } },
  { key: "traditional", label: { ko: "전통", en: "Traditional" } },
  { key: "landmark", label: { ko: "랜드마크", en: "Landmark" } },
  { key: "digital", label: { ko: "디지털", en: "Digital" } },
  { key: "river", label: { ko: "한강", en: "River" } },
  { key: "park", label: { ko: "공원", en: "Park" } },
  { key: "bridge", label: { ko: "다리", en: "Bridge" } },
  { key: "shopping", label: { ko: "쇼핑", en: "Shopping" } },
  { key: "stadium", label: { ko: "경기장", en: "Stadium" } },
  { key: "subway", label: { ko: "지하철", en: "Subway" } },
];

function useUserLocation() {
  const [pos, setPos] = useState(null);
  const [error, setError] = useState(null);
  const request = () => {
    if (!navigator.geolocation) return setError("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      p => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      e => setError(e.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  return { pos, error, request };
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.3 });
  }, [center, zoom, map]);
  return null;
}

export default function App() {
  const [lang, setLang] = useState("ko");
  const t = UI[lang];

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);

  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [zoom, setZoom] = useState(12);

  const { pos, request } = useUserLocation();

  // 위치가 갱신되면 자동으로 지도 이동
  useEffect(() => {
    if (pos) {
      setCenter(pos);
      setZoom(16);
    }
  }, [pos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLACES.filter(
      p =>
        (cat === "all" || p.category === cat) &&
        (!q ||
          p.name.ko.toLowerCase().includes(q) ||
          p.name.en.toLowerCase().includes(q) ||
          p.summary.ko.toLowerCase().includes(q) ||
          p.summary.en.toLowerCase().includes(q))
    );
  }, [query, cat]);

  const openDirections = () => {
    const pts = filtered.slice(0, 10);
    if (pts.length === 0) return;
    const origin = pos ? `${pos.lat},${pos.lng}` : `${pts[0].lat},${pts[0].lng}`;
    const destination = `${pts[pts.length - 1].lat},${pts[pts.length - 1].lng}`;
    const waypoints = pts.slice(1, -1).map(p => `${p.lat},${p.lng}`).join("|");
    const url =
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}` +
      (waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : "") +
      "&travelmode=walking";
    window.open(url, "_blank");
  };

  return (
    // 모바일 높이 보정: index.css에 --app-dvh 정의 있음
    <div className="w-full min-h-[var(--app-dvh)] flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <MapPin className="w-6 h-6" />
          <div className="flex-1">
            {/* CJK 단어 단위 줄바꿈: break-keep */}
            <h1 className="text-xl font-semibold leading-tight break-keep">{t.title}</h1>
            <p className="text-xs text-gray-600 break-keep">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(prev => (prev === "ko" ? "en" : "ko"))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-sm text-sm hover:bg-gray-50"
              title={t.langLabel}
            >
              <Languages className="w-4 h-4" /> {lang === "ko" ? "EN" : "KO"}
            </button>
            <button
              onClick={openDirections}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-sm text-sm hover:bg-gray-50"
              title={t.followRouteHint}
            >
              <Route className="w-4 h-4" /> {t.buildRoute}
            </button>
            <button
              onClick={() => request()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-sm text-sm hover:bg-gray-50"
            >
              <LocateFixed className="w-4 h-4" /> {t.nearMe}
            </button>
          </div>
        </div>
      </header>

      {/* Body: 모바일에선 맵이 먼저(위), 리스트는 아래. 데스크톱(md↑)에선 좌측 리스트/우측 맵 */}
      <div className="flex-1 grid grid-rows-[55dvh_1fr] md:grid-rows-1 md:grid-cols-[380px_1fr]">
        {/* Map first on mobile */}
        <div className="order-1 md:order-2 relative h-[55dvh] md:h-auto">
          <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="w-full h-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo center={center} zoom={zoom} />
            {filtered.map(p => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                eventHandlers={{
                  click: () => {
                    setSelected(p);
                    setCenter({ lat: p.lat, lng: p.lng });
                    setZoom(16);
                  },
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="font-medium break-keep">{p.name[lang]}</div>
                    <div className="text-xs text-gray-600 mt-1 break-words">{p.summary[lang]}</div>
                    <a
                      className="text-xs inline-flex items-center gap-1 mt-2 underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" /> {t.directions}
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Details drawer: 데스크톱에서만 */}
          {selected && (
            <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] md:w-[480px] bg-white rounded-2xl shadow-xl border p-4 z-10">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-gray-100 border flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base break-keep">{selected.name[lang]}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {lang === "ko" ? UI.ko.sourceTag : UI.en.sourceTag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 break-words">{selected.summary[lang]}</p>
                  <p className="text-xs text-gray-500 mt-1 break-words">{selected.address}</p>
                  <div className="flex gap-2 mt-3">
                    <a
                      className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-lg border hover:bg-gray-50"
                      href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" /> {t.directions}
                    </a>
                    <button
                      className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-lg border hover:bg-gray-50"
                      onClick={() => {
                        setCenter({ lat: selected.lat, lng: selected.lng });
                        setZoom(16);
                      }}
                    >
                      <Route className="w-3 h-3" /> {lang === "ko" ? "지도 중심" : "Center map"}
                    </button>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50">✕</button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar second on mobile */}
        <aside className="order-2 md:order-1 border-t md:border-t-0 md:border-r bg-white overflow-y-auto">
          <div className="p-3 border-b bg-white sticky top-[56px] md:top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring"
                  placeholder={t.search}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 rounded-xl border text-sm"
                value={cat}
                onChange={e => setCat(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>
                    {c.label[lang]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ul className="divide-y">
            {filtered.length === 0 && <li className="p-4 text-sm text-gray-500">{t.empty}</li>}
            {filtered.map(p => (
              <li key={p.id} className="p-3 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <button
                    className="shrink-0 w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center border"
                    onClick={() => { setCenter({ lat: p.lat, lng: p.lng }); setZoom(16); }}
                    title="Center on map"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium break-keep">{p.name[lang]}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {lang === "ko" ? UI.ko.sourceTag : UI.en.sourceTag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 break-words">{p.summary[lang]}</p>
                    <p className="text-xs text-gray-500 mt-0.5 break-words">{p.address}</p>
                    <div className="flex gap-2 mt-2">
                      <a
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-lg border hover:bg-gray-50"
                        href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" /> {t.directions}
                      </a>
                      <button
                        className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-lg border hover:bg-gray-50"
                        onClick={() => { setSelected(p); setCenter({ lat: p.lat, lng: p.lng }); setZoom(16); }}
                      >
                        {t.details}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <footer className="px-4 py-2 text-[11px] text-gray-500 border-t bg-white/70">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="break-keep">
            {lang === "ko"
              ? "장소 데이터는 서울시 미디어허브에 공개된 <케이팝 데몬 헌터스> 서울 배경 목록을 참고했습니다."
              : "Locations seeded from Seoul Metropolitan Government media listings for K-Pop Demon Hunters."}
          </span>
          <a href="https://mediahub.seoul.go.kr/archives/2015242" target="_blank" rel="noreferrer" className="underline">
            {lang === "ko" ? "참고 링크" : "Reference"}
          </a>
        </div>
      </footer>
    </div>
  );
}
