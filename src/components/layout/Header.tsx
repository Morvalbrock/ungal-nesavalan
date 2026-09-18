import Link from "next/link";

export function Header() {
  return (
    <header style={{ borderBottom: "1px solid #ddd", padding: "16px 0" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between" }}>
        <Link href="/"><strong>Ungal Nesavalan</strong></Link>
        <nav style={{ display: "flex", gap: 20 }}>
          <Link href="/products">Products</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/account">Account</Link>
        </nav>
      </div>
    </header>
  );
}
