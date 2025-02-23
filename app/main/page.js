"use client";
import React, { useState, useEffect, useCallback } from "react";

const API_KEY = "AlzaSyUKULN65T7V_X3Ul-s5JGYMvtwP5Vwjupx"; // Replace with your new API key
const BASE_URL = "https://maps.gomaps.pro";

// Button component
function Button({ children, variant = "default", className = "", ...props }) {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variants = {
        default: "bg-blue-600 hover:bg-blue-700 text-white",
        destructive: "bg-red-600 hover:bg-red-700 text-white",
    };
    return <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export default function Home() {
    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [routePolyline, setRoutePolyline] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [markerCounter, setMarkerCounter] = useState(1);

    // Load Google Maps script
    useEffect(() => {
        const loadScript = () => {
            const script = document.createElement("script");
            script.src = `${BASE_URL}/maps/api/js?key=${API_KEY}&callback=initMap&libraries=geometry`;
            script.async = true;
            script.defer = true;
            script.onerror = () => console.error("Failed to load Google Maps script");
            window.initMap = initMap;
            document.body.appendChild(script);
        };

        if (!window.google?.maps) loadScript();
        else initMap();
    }, []);

    // Initialize the map
    const initMap = useCallback(() => {
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const userLocation = { lat: coords.latitude, lng: coords.longitude };
                const mapConfig = {
                    center: userLocation,
                    zoom: 12,
                    mapId: "DEMO_MAP_ID"
                };

                const newMap = new window.google.maps.Map(document.getElementById("map"), mapConfig);
                const userMarker = new window.google.maps.Marker({
                    position: userLocation,
                    map: newMap,
                    label: "You",
                });

                newMap.addListener("click", (e) => handleMapClick(e, newMap));
                setMap(newMap);
                setCurrentLocation(userMarker);
            },
            (error) => alert("Geolocation permission denied: " + error.message)
        );
    }, []);

    // Handle map clicks
    const handleMapClick = useCallback((event, mapInstance) => {
        if (!mapInstance || !event.latLng) return;

        const newMarker = new window.google.maps.Marker({
            position: event.latLng,
            map: mapInstance,
            label: markerCounter.toString(),
        });

        setMarkers(prev => [...prev, newMarker]);
        setMarkerCounter(prev => prev + 1);
    }, [markerCounter]);

    // Calculate TSP route
    const calculateTSPRoute = useCallback(() => {
        if (!markers.length) {
            alert("Add at least one marker!");
            return;
        }

        try {
            const coordinates = markers.map(marker => ({
                lat: marker.position.lat(),
                lng: marker.position.lng()
            }));

            const allPoints = [
                { lat: currentLocation.position.lat(), lng: currentLocation.position.lng() },
                ...coordinates
            ];

            drawRoute(nearestNeighborTSP(allPoints));
        } catch (error) {
            console.error("Routing error:", error);
            alert("Error calculating route");
        }
    }, [markers, currentLocation]);

    // Nearest Neighbor TSP algorithm
    const nearestNeighborTSP = (points) => {
        const visited = new Set([0]);
        const route = [points[0]];
        let currentPoint = points[0];

        while (route.length < points.length) {
            let [nearestIndex, nearestDist] = [-1, Infinity];

            points.forEach((point, index) => {
                if (!visited.has(index)) {
                    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                        new window.google.maps.LatLng(currentPoint.lat, currentPoint.lng),
                        new window.google.maps.LatLng(point.lat, point.lng)
                    );
                    if (distance < nearestDist) [nearestIndex, nearestDist] = [index, distance];
                }
            });

            if (nearestIndex !== -1) {
                currentPoint = points[nearestIndex];
                route.push(currentPoint);
                visited.add(nearestIndex);
            }
        }

        return [...route, points[0]]; // Return to start
    };

    // Draw the route
    const drawRoute = useCallback((path) => {
        if (routePolyline) routePolyline.setMap(null);

        const newPolyline = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map
        });

        setRoutePolyline(newPolyline);
    }, [map, routePolyline]);

    // Clear markers and route
    const clearMarkers = useCallback(() => {
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
        setMarkerCounter(1);
        routePolyline?.setMap(null);
        setRoutePolyline(null);
    }, [markers, routePolyline]);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Go Maps Route Optimizer
                    </h1>
                    <p className="text-lg text-gray-600">
                        Click on the map to add markers and optimize your route
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                    <div id="map" className="w-full h-[600px] border border-gray-200"></div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={calculateTSPRoute} disabled={!markers.length} className="px-6 py-2">
                        Optimize Route
                    </Button>
                    <Button onClick={clearMarkers} variant="destructive" className="px-6 py-2">
                        Clear Markers
                    </Button>
                </div>
            </div>
        </div>
    );
}