import React from "react";
import { __ } from "@wordpress/i18n";
import { useLocation, useNavigate } from "react-router-dom";
import { is_pro, route_path } from "@GFUtils/helper";
import { general, license, mail } from "@GFUtils/icons";
import { useSelector } from "react-redux";

const LeftBar = () => {
  const navigate = useNavigate();
  const locationQuery = useLocation();
  const tabMatch = locationQuery.search.match(/[?&]tab=([^&]+)/);
  const currentTab = tabMatch ? tabMatch[1] : 'dashboard';
  const addons = useSelector(state => state.addons) || {};

  const isAddonActive = (slug) => !!addons[slug];

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
      icon: general()
    },
    {
      label: __("Ecommrce", "gameengine"),
      key: "economy",
      desc: __("Ecommrce settings", "gameengine"),
      icon: general()
    },
    {
      label: __("Coupon Generate", "gameengine"),
      key: "marketplace",
      desc: __("Coupon Generate", "gameengine"),
      icon: general()
    },
    {
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
    },
    ...(is_pro ? [{
      label: __("License", "gameengine"),
      key: "license",
      desc: __("Manage your license key", "gameengine"),
      icon: license()
    }] : []),
    {
      label: __("Email Templates", "gameengine"),
      key: "email_templates",
      desc: __("Customize Email Templates & Cron", "gameengine"),
      icon: mail()
    },
    // ── Free addon settings tabs ──────────────────────────────────────────
    ...(isAddonActive('points_expiration') ? [{
      label: __("Expiration", "gameengine"),
      key: "expiration",
      desc: __("Points expiration rules per type", "gameengine"),
      icon: general()
    }] : []),
    ...(isAddonActive('buddypress_integration') || isAddonActive('learndash_integration') || isAddonActive('bbpress_integration') ? [{
      label: __("Integrations", "gameengine"),
      key: "integrations",
      desc: __("BuddyPress, LearnDash, bbPress", "gameengine"),
      icon: general()
    }] : []),
    ...(isAddonActive('social_sharing') ? [{
      label: __("Social Sharing", "gameengine"),
      key: "social_sharing",
      desc: __("Social share rewards & networks", "gameengine"),
      icon: general()
    }] : []),
    ...(isAddonActive('progress_bar') ? [{
      label: __("Progress Bar", "gameengine"),
      key: "progress_bar_settings",
      desc: __("Default appearance settings", "gameengine"),
      icon: general()
    }] : []),
    ...(isAddonActive('new_engagement_triggers') ? [{
      label: __("Engagement Triggers", "gameengine"),
      key: "engagement_triggers",
      desc: __("Enable/disable trigger events", "gameengine"),
      icon: general()
    }] : []),
    // ── Pro addon settings tabs ───────────────────────────────────────────
    ...(is_pro && isAddonActive('point_transfers') ? [{
      label: __("Transfers", "gameengine"),
      key: "transfers",
      desc: __("Transfer fee & limits", "gameengine"),
      icon: general(),
      is_pro: true,
    }] : []),
    ...(is_pro && isAddonActive('buy_points') ? [{
      label: __("Buy Points", "gameengine"),
      key: "buy_points_settings",
      desc: __("Packages & payment gateways", "gameengine"),
      icon: general(),
      is_pro: true,
    }] : []),
    ...(is_pro && isAddonActive('point_exchange') ? [{
      label: __("Point Exchange", "gameengine"),
      key: "point_exchange",
      desc: __("Exchange pair configuration", "gameengine"),
      icon: general(),
      is_pro: true,
    }] : []),
    ...(is_pro && isAddonActive('points_cap') ? [{
      label: __("Points Cap", "gameengine"),
      key: "points_cap_settings",
      desc: __("Maximum balance per type", "gameengine"),
      icon: general(),
      is_pro: true,
    }] : []),
    ...(is_pro && isAddonActive('sell_content') ? [{
      label: __("Sell Content", "gameengine"),
      key: "sell_content",
      desc: __("Content paywall defaults", "gameengine"),
      icon: general(),
      is_pro: true,
    }] : []),
    ...(is_pro && isAddonActive('toast_notifications') ? [{
      label: __("Toast Notifications", "gameengine"),
      key: "toast_notifications",
      desc: __("Position, duration & events", "gameengine"),
      icon: general(),
      is_pro: true,
    }] : []),
    ...(is_pro && isAddonActive('open_badges') ? [{
      label: __("Open Badges", "gameengine"),
      key: "open_badges",
      desc: __("Issuer identity for OB 2.0", "gameengine"),
      icon: general(),
      is_pro: true,
    }] : []),
  ];

  return <div className="flex flex-col sticky top-0 self-start bg-white rounded-lg [box-shadow:var(--gameengine-shadow)]" style={{ "minWidth": "284px" }}>
    <div className="flex flex-col items-stretch p-2">
      {menuList.map((item, i) => {
        const isActive = currentTab === item.key;
        return (
          <div className="flex items-start cursor-pointer gap-3" style={{
            "padding": "8px 16px",
            "transition": "all 0.3s ease-in-out",
            "background": isActive ? "var(--gameengine-secondary-color)" : "transparent"
          }} key={i} onClick={() => navigate(`${route_path}admin.php?page=gameengine-settings&settings=1&tab=${item.key}`)}>
            <span className={`${isActive ? "var(--gameengine-primary)" : "var(--gameengine-font-color)"} mt-1`}>{item?.icon}</span>

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
          </div>
        );
      })}
    </div>
  </div>;
};

export default LeftBar;
