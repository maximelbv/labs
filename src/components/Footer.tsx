import { MAXIMELBV_LINK } from "../constants/links";

const Footer = () => {
  return (
    <div className="p-4 !m-auto !mt-10 z-100 !border-t !border-border-default">
      <div className="flex items-center gap-0.5">
        <span className="text-text-muted !mt-[4px]">Buildt by</span>
        <a
          href={MAXIMELBV_LINK}
          target="blank_"
          className="p-1 rounded-lg hover:bg-elem-background"
        >
          <img className="!object-contain" src="/maximelbv-logo.svg" />
        </a>
      </div>
    </div>
  );
};

export default Footer;
