import React from 'react';

const WeatherRadar = ({ location }) => {
    if (!location) return null;

    const { latitude, longitude } = location;

    // Windy Embed URL construction
    // Ref: https://api.windy.com/map-forecast/examples/embed
    const embedUrl = `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&detailLat=${latitude}&detailLon=${longitude}&width=650&height=450&zoom=8&level=surface&overlay=radar&product=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;

    return (
        <div className="weather-radar-container" style={{ width: '100%', height: '300px', borderRadius: '15px', overflow: 'hidden' }}>
            <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                frameBorder="0"
                title="Weather Radar"
                style={{ border: 'none' }}
                allow="geolocation"
            ></iframe>
        </div>
    );
};

export default WeatherRadar;
