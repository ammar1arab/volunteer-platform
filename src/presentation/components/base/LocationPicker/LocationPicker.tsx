"use client";
// @ts-ignore
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
import { Search, MapPinned, Link, X, ChevronDown, Check, Loader2, Navigation } from "lucide-react";
import { useLocationPicker, LatLng, SearchResult } from "./LocationPicker.logic";
import styles from "./LocationPicker.module.scss";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

const MapFixer = () => {
    const { useMap } = require("react-leaflet");
    const map = useMap();
    useEffect(() => { setTimeout(() => map.invalidateSize(), 200); }, [map]);
    return null;
};

const MapEvents = ({ onClick }: { onClick: (p: LatLng) => void }) => {
    const { useMapEvents } = require("react-leaflet");
    useMapEvents({ click: (e: any) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
    return null;
};

const DraggableMarker = ({ position, icon, onDragEnd }: { position: LatLng; icon: any; onDragEnd: (p: LatLng) => void }) => {
    const markerRef = useRef<any>(null);
    const handlers = {
        dragend() {
            const m = markerRef.current;
            if (m) { const p = m.getLatLng(); onDragEnd({ lat: p.lat, lng: p.lng }); }
        },
    };
    return <Marker position={[position.lat, position.lng]} icon={icon} draggable ref={markerRef} eventHandlers={handlers} />;
};

type Props = {
    latitude: number;
    longitude: number;
    onChange: (lat: number, lng: number) => void;
    label?: string;
};

const LocationPicker = ({ latitude, longitude, onChange, label = "موقع الفعالية" }: Props) => {
    const { state, dispatch, searchByAddress, selectResult, detectLocation, parseMapsLink } =
        useLocationPicker({ latitude, longitude, onChange });

    const [icon, setIcon] = useState<any>(null);

    useEffect(() => {
        const L = require("leaflet");
        setIcon(new L.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
        }));
    }, []);

    if (!state.isMounted) return null;

    const hasLocation = latitude !== 0 || longitude !== 0;
    const previewSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.012}%2C${latitude - 0.012}%2C${longitude + 0.012}%2C${latitude + 0.012}&layer=mapnik&marker=${latitude}%2C${longitude}`;

    const handleMapClick = (p: LatLng) => {
        dispatch({ type: "SET_COORDS", payload: p });
        onChange(p.lat, p.lng);
    };

    const handleDragEnd = (p: LatLng) => {
        dispatch({ type: "SET_COORDS", payload: p });
        onChange(p.lat, p.lng);
    };

    return (
        <div className={styles.wrapper}>
            <label className={styles.label}>{label}</label>

            {/* البحث */}
            <div className={styles.searchWrap}>
                <div className={styles.searchRow}>
                    <input
                        className={styles.input}
                        placeholder="ابحث عن موقع... مثال: عمان، الأردن"
                        value={state.searchQuery}
                        onChange={(e) => dispatch({ type: "SET_QUERY", payload: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchByAddress())}
                    />
                    <button type="button" className={styles.btnSearch} onClick={searchByAddress} disabled={state.searching}>
                        {state.searching ? <Loader2 size={14} className={styles.spin} /> : <Search size={14} />}
                        {state.searching ? "جاري..." : "بحث"}
                    </button>
                </div>
                {state.searchResults.length > 0 && (
                    <ul className={styles.results}>
                        {state.searchResults.map((r: SearchResult, i: number) => (
                            <li key={i} className={styles.resultItem} onClick={() => selectResult(r)}>
                                <Navigation size={13} className={styles.resultIcon} />
                                <span>{r.label}</span>
                            </li>
                        ))}
                    </ul>
                )}
                {state.searchError && <p className={styles.error}>{state.searchError}</p>}
            </div>

            {/* الصق رابط */}
            <div className={styles.linkRow}>
                <input
                    className={styles.input}
                    placeholder="أو الصق رابط خرائط جوجل..."
                    value={state.linkInput}
                    onChange={(e) => dispatch({ type: "SET_LINK", payload: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), parseMapsLink(state.linkInput))}
                />
                <button type="button" className={styles.btnSearch} onClick={() => parseMapsLink(state.linkInput)} disabled={!state.linkInput.trim()}>
                    <Link size={14} />
                    استخراج
                </button>
            </div>
            {state.linkError && <p className={styles.error}>{state.linkError}</p>}

            {/* GPS */}
            <button type="button" className={styles.btnLocate} onClick={detectLocation} disabled={state.locating}>
                <MapPinned size={14} />
                {state.locating ? "جاري تحديد موقعك..." : "استخدم موقعي الحالي (GPS)"}
            </button>
            {state.locationError && <p className={styles.error}>{state.locationError}</p>}

            {/* معاينة أو زر اختيار */}
            {hasLocation ? (
                <div className={styles.previewWrap} onClick={() => dispatch({ type: "TOGGLE_MAP", payload: true })}>
                    <iframe title="map-preview" src={previewSrc} className={styles.previewFrame} />
                    <div className={styles.previewOverlay}>
                        <span>{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
                        <span className={styles.previewHint}>اضغط لتعديل الموقع</span>
                    </div>
                </div>
            ) : (
                <button type="button" className={styles.btnPickMap} onClick={() => dispatch({ type: "TOGGLE_MAP", payload: true })}>
                    <MapPinned size={14} />
                    اختر من الخريطة
                </button>
            )}

            {/* إدخال يدوي */}
            <details className={styles.manual}>
                <summary className={styles.manualTitle}>
                    <ChevronDown size={14} /> إدخال الإحداثيات يدوياً
                </summary>
                <div className={styles.manualFields}>
                    <div className={styles.field}>
                        <label className={styles.labelSm}>خط العرض (Latitude)</label>
                        <input className={styles.input} type="number" step="any" value={latitude}
                            onChange={(e) => onChange(parseFloat(e.target.value) || 0, longitude)} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.labelSm}>خط الطول (Longitude)</label>
                        <input className={styles.input} type="number" step="any" value={longitude}
                            onChange={(e) => onChange(latitude, parseFloat(e.target.value) || 0)} />
                    </div>
                </div>
            </details>

            {/* المودال */}
            {state.mapOpen && (
                <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && dispatch({ type: "TOGGLE_MAP", payload: false })}>
                    <div className={styles.modal}>

                        <div className={styles.modalHeader}>
                            <div>
                                <h3>تحديد الموقع</h3>
                                <p>اضغط على الخريطة أو اسحب الدبوس لتحديد الموقع بدقة</p>
                            </div>
                            <button type="button" className={styles.btnClose} onClick={() => dispatch({ type: "TOGGLE_MAP", payload: false })}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className={styles.modalSearch}>
                            <div className={styles.searchWrap}>
                                <div className={styles.searchRow}>
                                    <input
                                        className={styles.input}
                                        placeholder="ابحث عن موقع..."
                                        value={state.searchQuery}
                                        onChange={(e) => dispatch({ type: "SET_QUERY", payload: e.target.value })}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchByAddress())}
                                    />
                                    <button type="button" className={styles.btnSearch} onClick={searchByAddress} disabled={state.searching}>
                                        {state.searching ? <Loader2 size={14} className={styles.spin} /> : <Search size={14} />}
                                        {state.searching ? "جاري..." : "بحث"}
                                    </button>
                                </div>
                                {state.searchResults.length > 0 && (
                                    <ul className={styles.results}>
                                        {state.searchResults.map((r: SearchResult, i: number) => (
                                            <li key={i} className={styles.resultItem} onClick={() => selectResult(r)}>
                                                <Navigation size={13} className={styles.resultIcon} />
                                                <span>{r.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className={styles.mapContainer}>
                            <MapContainer
                                center={[state.markerPos.lat, state.markerPos.lng]}
                                zoom={14}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapFixer />
                                <MapEvents onClick={handleMapClick} />
                                {icon && <DraggableMarker position={state.markerPos} icon={icon} onDragEnd={handleDragEnd} />}
                            </MapContainer>
                        </div>

                        <div className={styles.modalFooter}>
                            <div className={styles.coordsDisplay}>
                                <span>خط العرض: {state.markerPos.lat.toFixed(5)}</span>
                                <span>خط الطول: {state.markerPos.lng.toFixed(5)}</span>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={() => dispatch({ type: "TOGGLE_MAP", payload: false })}>
                                    إلغاء
                                </button>
                                <button type="button" className={styles.btnSave} onClick={() => {
                                    onChange(state.markerPos.lat, state.markerPos.lng);
                                    dispatch({ type: "TOGGLE_MAP", payload: false });
                                }}>
                                    <Check size={16} /> تأكيد الموقع
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;