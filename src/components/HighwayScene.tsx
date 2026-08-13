const BG_URL = `${import.meta.env.BASE_URL}artwork/highway-bg.jpg`;

const DUST_COUNT = 10;
const dustSeeds = Array.from({ length: DUST_COUNT }, (_, i) => ({
  left: Math.round((i * 37 + 11) % 100),
  bottom: Math.round(20 + ((i * 53) % 40)),
  delay: ((i * 1.7) % 14).toFixed(1),
  duration: (10 + ((i * 2.3) % 8)).toFixed(1),
}));

/** The uploaded HIGHWAY FM illustration, used directly as the environment. */
export function HighwayScene() {
  return (
    <div className="scene" aria-hidden="true" style={{ backgroundImage: `url(${BG_URL})` }}>
      <div className="scene-shade" />
      <div className="dust">
        {dustSeeds.map((d, i) => (
          <span
            key={i}
            style={{
              left: `${d.left}%`,
              bottom: `${d.bottom}%`,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
