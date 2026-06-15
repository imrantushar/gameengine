import React from "react";
import { __ } from "@wordpress/i18n";
import { useLocation, useNavigate } from "react-router-dom";
import { is_pro, route_path } from "@GFUtils/helper";
import { couponIcon, ecomIcon, general, licenseIcon, logIcon, mail, payoutIcon, refIcon } from "@GFUtils/icons";

const LeftBar = () => {
  const navigate = useNavigate();
  const locationQuery = useLocation();
  const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
  const currentTab = tabMatch ? tabMatch[1] : 'dashboard';

  const menuList = [
    {
      label: __("Frontend Dashboard", "gameengine"),
      key: "dashboard",
      desc: __("Frontend Dashboard settings", "gameengine"),
      icon: general()
    },
    {
      label: __("Log", "gameengine"),
      key: "log",
      desc: __("Log settings", "gameengine"),
      icon: logIcon()
    },
    {
      label: __("E-commerce", "gameengine"),
      key: "economy",
      desc: __("E-commerce settings", "gameengine"),
      icon: ecomIcon()
    },
    {
      label: __("Coupon Generate", "gameengine"),
      key: "marketplace",
      desc: __("Coupon Generate", "gameengine"),
      icon: couponIcon()
    },
    {
      label: __("Payout", "gameengine"),
      key: "payout",
      desc: __("Payout settings", "gameengine"),
      icon: payoutIcon()
    },
    {
      label: __("Referral", "gameengine"),
      key: "referral",
      desc: __("Referral & Affiliate Systems", "gameengine"),
      icon: refIcon(),
      is_pro: true,
    },
    {
      label: __("Email Templates", "gameengine"),
      key: "email_templates",
      desc: __("Customize Email Templates & Cron", "gameengine"),
      icon: mail()
    },
    ...(is_pro ? [{
      label: __("License", "gameengine"),
      key: "license",
      desc: __("Manage your license key", "gameengine"),
      icon: licenseIcon()
    }] : []),
  ];

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
