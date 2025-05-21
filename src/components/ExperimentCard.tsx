import { Link } from "react-router";

type ExperimentCardProps = {
  slug: string;
  title: string;
  category: string;
  cover: string;
};

const ExperimentCard = ({
  slug,
  title,
  category,
  cover,
}: ExperimentCardProps) => {
  return (
    <Link key={title} to={`/${slug}`}>
      <div className="group relative flex items-center border border-border-light justify-center rounded-xl bg-white aspect-video overflow-hidden">
        <img
          src={cover}
          className="w-full h-full object-cover transition-opacity"
        />
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none" />
        <div className="group-hover:flex hidden absolute flex-col items-center z-10">
          <span className="text-text-muted">{category}</span>
          <span className="font-bold text-2xl text-text-primary leading-6">
            {title}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ExperimentCard;
