import { Link } from "react-router-dom";
import Hyperspeed from "./backgrounds/Hyperspeed";

export default function Hero({ onDeploy }) {
  return (
    <section className="hero">
      <div className="hero-hyperspeed">
        <Hyperspeed
          effectOptions={{
            distortion: "turbulentDistortion",

            length: 320,
            roadWidth: 10,
            islandWidth: 2,
            lanesPerRoad: 4,

            fov: 90,
            fovSpeedUp: 120,
            speedUp: 0.38,

            carLightsFade: 0.32,

            totalSideLightSticks: 30,
            lightPairsPerRoadWay: 50,

            colors: {
              roadColor: 0x05070d,
              islandColor: 0x081018,
              background: 0x000000,

              shoulderLines: 0x0f172a,
              brokenLines: 0x0f172a,

              leftCars: [
                0x06b6d4,
                0x0891b2,
                0x155e75
              ],

              rightCars: [
                0x22c55e,
                0x14b8a6,
                0x0f766e
              ],

              sticks: 0x06b6d4,
            },
          }}
        />
      </div>

      <div className="mesh-bg"></div>

      <div className="hero-content">
        <div className="eyebrow">distributed sensor infrastructure</div>

        <h1>
          Deploy in minutes.
          <br />
          <span className="hero-green hero-nowrap">
            Start contributing immediately.
          </span>
        </h1>

        <p className="lead">
          Deploy your desired honeypot sensor on your VPS in one command and
          help the community detect malicious activity across the internet.
        </p>

        <div className="cta-row">
          <button className="primary" onClick={onDeploy}>
            Deploy sensor
          </button>

          <Link to="/lookup" className="secondary">
            Open IP lookup ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
