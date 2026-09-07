import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { route_path } from "@GFUtils/helper";
import { DEFAULT_TAB, getTabs } from "./tabs-config";

const LeftBar = () => {
  const navigate = useNavigate();
  const locationQuery = useLocation();
  const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
  const currentTab = tabMatch ? tabMatch[1] : DEFAULT_TAB;

  const menuList = getTabs();

  return (
    <div className="flex flex-col sticky top-0 self-start bg-white rounded-lg [box-shadow:var(--gameengine-shadow)] min-w-[284px]">
      <div className="flex flex-col gap-1 items-stretch p-2">
        {menuList.map((item, i) => {
          const isActive = currentTab === item.key;
          return (
            <div className={`flex items-start cursor-pointer gap-3 px-4 py-2 transition-all duration-300 ease-in-out ${isActive ? "bg-[var(--gameengine-secondary-color)]" : "bg-transparent"}`} key={i} onClick={() => navigate(`${route_path}admin.php?page=gameengine-settings&settings=1&tab=${item.key}`)}>
              <span className={`${isActive ? "text-[var(--gameengine-primary)]" : "text-[var(--gameengine-font-color)]"}`}>{item?.icon}</span>

              <div>
                <p
                  className={`text-sm leading-5 font-semibold m-0 ${isActive ? "text-[var(--gameengine-primary)]" : "text-[var(--gameengine-font-color)]"
                    }`}
                >
                  {item.label}
                </p>

                <p
                  className={`text-xs font-normal leading-4 m-0 mt-1 ${isActive ? "text-[var(--gameengine-primary)]" : "text-[#738496]"
                    }`}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeftBar;
