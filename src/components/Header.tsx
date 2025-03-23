import { Link } from "react-router";
import Logo from "./Logo";
import { MAXIMELBV_LINK } from "../constants/links";

const Header = () => {
  return (
    <div className="flex justify-start p-4">
      <div className="flex flex-col gap-1.5">
        <a href={MAXIMELBV_LINK} target="blank_">
          <img className="!object-contain" src="/maximelbv-logo.svg" />
        </a>
        <Link to="/">
          <Logo />
        </Link>
      </div>
    </div>
  );
};

export default Header;
