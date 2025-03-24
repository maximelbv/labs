import { Link } from "react-router";

interface ExperimentCardProps {
  exp: string;
}

const ExperimentCard = ({ exp }: ExperimentCardProps) => {
  return (
    <Link
      key={exp}
      to={`/${exp}`}
      className="group relative flex items-center border border-border-light justify-center rounded-xl bg-white aspect-video overflow-hidden"
    >
      {/* <div className="group-hover:top-0 text-lg absolute top-[-100%] left-0 w-full px-4 py-3 border-b border-border-light flex justify-between items-center font-jetbrains transition-all ease-[cubic-bezier(.4,.38,.12,.99)] duration-600">
        {exp}
        <span className="text-text-muted-light">
          #{index.toString().padStart(3, "0")}
        </span>
      </div> */}
      {exp}
    </Link>
  );
};

export default ExperimentCard;
