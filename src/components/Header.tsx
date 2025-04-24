import { Link } from "react-router";
import Logo from "./Logo";
import { MAXIMELBV_LINK } from "../constants/links";

const Header = ({ className }: { className: string }) => {
  return (
    <div className={`flex justify-start p-4 ${className}`}>
      <div className="flex flex-col gap-1">
        <Link to="/">
          <Logo />
        </Link>
        <a href={MAXIMELBV_LINK} target="blank_">
          <img className="!object-contain" src="/maximelbv-logo.svg" />
        </a>
      </div>
    </div>
  );
};

export default Header;
