import NavbarComponent from "../../components/Navbar/page";

export default function UserLayout({ children }) {
  return (
    <div>
      <NavbarComponent />
      {children}
    </div>
  );
}
