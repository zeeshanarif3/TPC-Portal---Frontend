import React, { useState } from "react";
import {
    LayoutDashboard,
    Building2,
    UserRound,
    FileSignature,
    CalendarClock,
    CalendarDays,
    ClipboardCheck,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import "./sideb.css";
import UserInfo from "./component/userinfo";

/**
 * Sidebar
 *
 * Props:
 * - activeItem (string)      controlled active key, e.g. "dashboard"
 * - onNavigate (fn)          called with the item key when a nav item is clicked
 * - defaultCollapsed (bool)  initial collapsed state (default false)
 *
 * The component manages its own collapsed state and active-item state
 * internally if no props are passed, so it also works fully standalone.
 */

const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "college", label: "College", icon: Building2 },
    { key: "trainer", label: "Trainer", icon: UserRound },
    { key: "contracts", label: "Contracts", icon: FileSignature },
    { key: "sessions", label: "Sessions", icon: CalendarClock },
    { key: "schedule", label: "Schedule", icon: CalendarDays },
    { key: "attendance", label: "Attendance", icon: ClipboardCheck }
    //   {
    //     key: "",
    //     label: "",
    //     icon: ,
    //     children: [
    //       { key: "attendance-students", label: "Students" },
    //       { key: "attendance-trainers", label: "Trainers" },
    //       { key: "attendance-reports", label: "Reports" },
    //     ],
    //   },
];

export default function Sideb({
    activeItem: activeItemProp,
    onNavigate,
    defaultCollapsed = false,
    role,
    handleLogout,
}) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [internalActive, setInternalActive] = useState("dashboard");
    const [expandedKey, setExpandedKey] = useState("attendance");

    const activeItem = activeItemProp ?? internalActive;

    const handleSelect = (key, hasChildren) => {
        if (hasChildren) {
            if (collapsed) {
                // expanding sidebar makes more sense than opening a submenu while collapsed
                setCollapsed(false);
                setExpandedKey(key);
                return;
            }
            setExpandedKey((prev) => (prev === key ? null : key));
            return;
        }
        setInternalActive(key);
        onNavigate?.(key);
    };

    return (
        <aside className={`sb ${collapsed ? "sb--collapsed" : ""}`}>
            <div className="sb__brand">
                <div className="sb__brand-mark">IC</div>
                {!collapsed && (
                    <div className="sb__brand-text">
                        <span className="sb__brand-line">ICON /</span>
                        <span className="sb__brand-line">COMPANY</span>
                    </div>
                )}
            </div>

            <nav className="sb__nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = Boolean(item.children);
                    const isActive = activeItem === item.key;
                    const isExpanded = expandedKey === item.key && !collapsed;

                    return (
                        <div key={item.key} className="sb__group">
                            <button
                                type="button"
                                className={`sb__item ${isActive ? "sb__item--active" : ""}`}
                                onClick={() => handleSelect(item.key, hasChildren)}
                                title={collapsed ? item.label : undefined}
                                aria-current={isActive ? "page" : undefined}
                                aria-expanded={hasChildren ? isExpanded : undefined}
                            >
                                <span className="sb__item-icon">
                                    <Icon size={18} strokeWidth={1.75} />
                                </span>
                                {!collapsed && (
                                    <span className="sb__item-label">{item.label}</span>
                                )}
                                {!collapsed && hasChildren && (
                                    <ChevronRight
                                        size={14}
                                        className={`sb__chevron ${isExpanded ? "sb__chevron--open" : ""
                                            }`}
                                    />
                                )}
                            </button>

                            {hasChildren && isExpanded && (
                                <div className="sb__submenu">
                                    {item.children.map((child) => (
                                        <button
                                            key={child.key}
                                            type="button"
                                            className={`sb__subitem ${activeItem === child.key
                                                    ? "sb__subitem--active"
                                                    : ""
                                                }`}
                                            onClick={() => handleSelect(child.key, false)}
                                        >
                                            {child.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
            {/* <div className="role">
        {role.name}
      </div>

      <UserInfo></UserInfo> */}
            {
            (role)?(

            <UserInfo
                user={{
                    name: role.name,
                    email: role.email,
                }}
                role={{ role: role.role }}
                onLogout={() => {
                    handleLogout();
                }}
                collapsed={collapsed}
                />
            ):(null)};



















            <button
                type="button"
                className="sb__collapse-toggle"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? (
                    <ChevronsRight size={16} strokeWidth={1.75} />
                ) : (
                    <>
                        <ChevronsLeft size={16} strokeWidth={1.75} />
                        <span>Collapse</span>
                    </>
                )}
            </button>
        </aside>
    );
}