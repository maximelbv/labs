import { Link } from "react-router";
import Logo from "./Logo";

const Header = () => {
  return (
    <div className="flex justify-start p-4">
      <Link to="/">
        <Logo />
      </Link>
    </div>
  );
};

export default Header;
