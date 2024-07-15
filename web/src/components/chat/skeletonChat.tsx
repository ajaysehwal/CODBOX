import { Skeleton } from "../ui/skeleton";

export const SkeletonChat = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <li
          key={index}
          className={`flex ${
            index % 2 === 0 ? "justify-end" : "justify-start"
          } items-end mb-4`}
        >
          {index % 2 !== 0 && (
            <Skeleton className="w-10 h-10 rounded-full mr-3" />
          )}
          <div
            className={`flex flex-col ${
              index % 2 === 0 ? "items-end" : "items-start"
            }`}
          >
            {index % 2 !== 0 && <Skeleton className="w-20 h-4 mb-1" />}
            <Skeleton className="w-[150px] h-10 rounded-lg" />
          </div>
        </li>
      ))}
    </>
  );
  