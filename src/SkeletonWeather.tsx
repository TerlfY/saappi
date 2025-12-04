import React from "react";
import { Placeholder } from "react-bootstrap";

interface SkeletonWeatherProps {
    type?: "current" | "hourly";
}

const SkeletonWeather: React.FC<SkeletonWeatherProps> = ({ type = "current" }) => {
    if (type === "current") {
        return (
            <div className="text-center">
                <Placeholder as="h2" animation="glow" className="mt-3">
                    <Placeholder xs={6} />
                </Placeholder>
                <Placeholder as="div" animation="glow" className="m-5">
                    <Placeholder
                        xs={12}
                        style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                    />
                </Placeholder>
                <Placeholder as="p" animation="glow" className="fs-4">
                    <Placeholder xs={4} />
                </Placeholder>
            </div>
        );
    }

    if (type === "hourly") {
        return (
            <div className="d-flex justify-content-between">
                {[1, 2, 3, 4, 5].map((_, idx) => (
                    <div key={idx} className="text-center mx-2" style={{ width: "80px" }}>
                        <Placeholder as="p" animation="glow">
                            <Placeholder xs={8} />
                        </Placeholder>
                        <Placeholder as="div" animation="glow" className="my-2">
                            <Placeholder
                                xs={12}
                                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                            />
                        </Placeholder>
                        <Placeholder as="p" animation="glow">
                            <Placeholder xs={6} />
                        </Placeholder>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default SkeletonWeather;
