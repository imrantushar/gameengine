import React from "react";
import { __ } from "@wordpress/i18n";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@GFComponents/UI";
import { FiMail } from "react-icons/fi";
import { FaLock } from "react-icons/fa6";
import { is_pro, route_path } from "@GFUtils/helper";
import { general, license, mail } from "@GFUtils/icons";
const LeftBar = () => {
  const navigate = useNavigate();
  const locationQuery = useLocation();
  const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
  const currentTab = tabMatch ? tabMatch[1] : 'dashboard';
  const menuList = [{
    label: __("Frontend Dashboard", "gameengine"),
    key: "dashboard",
    desc: __("Frontend Dashboard settings", "gameengine"),
    icon: general()
  }, {
    label: __("Log", "gameengine"),
    key: "log",
    desc: __("Log settings", "gameengine"),
    icon: general()
  }, {
    label: __("Ecommrce", "gameengine"),
    key: "economy",
    desc: __("Ecommrce settings", "gameengine"),
    icon: general()
  }, {
    label: __("Coupon Generate", "gameengine"),
    key: "marketplace",
    desc: __("Coupon Generate", "gameengine"),
    icon: general()
  }, {
    label: __("Payout", "gameengine"),
    key: "payout",
    desc: __("Payout settings", "gameengine"),
    icon: general()
  },
  {
    label: __("Referral", "gameengine"),
    key: "referral",
    desc: __("Referral & Affiliate Systems", "gameengine"),
    icon: general(),
    is_pro: true,
  }, ...(is_pro ? [{
    label: __("License", "gameengine"),
    key: "license",
    desc: __("Manage your license key", "gameengine"),
    icon: license()
  }] : []), {
    label: __("Email Templates", "gameengine"),
    key: "email_templates",
    desc: __("Customize Email Templates & Cron", "gameengine"),
    icon: mail()
  },];
  return <div className="flex flex-col sticky top-0 self-start bg-white rounded [box-shadow:var(--gameengine-shadow)]" style={{ "minWidth": "284px" }}>
    <div className="flex flex-col items-stretch p-2" spacing={0}>
      {menuList.map((item, i) => {
        const isActive = currentTab === item.key;
        return <div className="flex items-start cursor-pointer gap-3" style={{
          "padding": "8px 16px",
          "transition": "all 0.3s ease-in-out",
          "background": isActive ? "var(--gameengine-secondary-color)" : "transparent"
        }} key={i} onClick={() => navigate(`${route_path}admin.php?page=gameengine-settings&settings=1&tab=${item.key}`)}>
          <Icon color={isActive ? "var(--gameengine-primary)" : "var(--gameengine-font-color)"} mt={1}>{item?.icon}</Icon>

          <div>
            <p className="text-sm leading-5 m-0" style={{
              "fontWeight": isActive ? "600" : "500",
              "color": isActive ? "var(--gameengine-primary)" : "var(--gameengine-font-color)"
            }}>
              {item.label}
            </p>

            <p className="text-xs font-normal leading-4 m-0" style={{
              "marginTop": "-2px",
              "color": isActive ? "var(--gameengine-primary)" : "#738496"
            }}>
              {item.desc}
            </p>
          </div>
        </div>;
      })}
    </div>
  </div>;
};
export default LeftBar;
