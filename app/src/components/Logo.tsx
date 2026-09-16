export function Grb({ className }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}brand/grb.png`}
      alt="Grb Istarske županije"
      className={className}
    />
  );
}

export function LogoBijeli({ className }: { className?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}brand/logo-iz-bijeli.png`}
      alt="Istarska županija"
      className={className}
    />
  );
}
