interface Props {
  visible: boolean;
}

export function LoadingScreen({ visible }: Props) {
  return (
    <div className={`loading-screen ${visible ? '' : 'hidden'}`} aria-hidden={!visible}>
      <div className="loading-content">
        <span className="loading-title">HIGHWAY FM</span>
        <span className="loading-sub">Tuning in…</span>
      </div>
    </div>
  );
}
