import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import "./userinfo.css";

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserInfo({ user, role, onLogout, collapsed }) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef();
    const menuRef = useRef();

    // Recompute the menu's screen position from the trigger's real
    // bounding box every time it opens, so it always lands next to the
    // button regardless of where that button sits in the layout (sidebar,
    // header, wherever) and regardless of any ancestor's overflow/scroll.

    useLayoutEffect(() => {
        if (!open) return;

        const trigger = document.querySelector(".user-trigger");
        const menu = document.querySelector(".user-menu");

        if (!trigger || !menu) return;

        const triggerRect = trigger.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();

        setCoords({
            top: triggerRect.top - menuRect.height - 16,
            left: triggerRect.left,
        });
    }, [open]);

    // useLayoutEffect(() => {
    //     if (!open || !triggerRef.current) return;

    //     const rect = triggerRef.current.getBoundingClientRect();

    //     setCoords({
    //         top: rect.bottom - 235,
    //         left: rect.left,
    //     });
    // }, [open]);
    useEffect(() => {
        const handleClick = (e) => {
            const clickedTrigger = triggerRef.current && triggerRef.current.contains(e.target);
            const clickedMenu = menuRef.current && menuRef.current.contains(e.target);
            if (!clickedTrigger && !clickedMenu) {
                setOpen(false);
            }
        };

        const handleScroll = () => setOpen(false);
        const handleResize = () => setOpen(false);

        document.addEventListener("mousedown", handleClick);
        // Closing on scroll/resize is simpler and safer than re-tracking
        // position continuously, and matches how most dropdown libraries
        // behave (e.g. native <select>, Radix, Headless UI).
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("mousedown", handleClick);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const initials = getInitials(user?.name);

    return (
        <div className="user-info">
            <div
                className="user-trigger"
                ref={triggerRef}
                onClick={() => setOpen((v) => !v)}
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={open}
            >
                <div className="user-avatar">{initials}</div>
                {(collapsed) ? (null) : (
                    <div className="user-info-text">

                        <span className="user-role">{role?.role}</span>
                        <span className={`user-trigger-caret ${open ? "open" : ""}`}>
                            <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>

                    </div>
                )}
            </div>

            {open &&
                createPortal(
                    <div
                        className="user-menu user-menu-portal"
                        ref={menuRef}
                        style={{ top: coords.top, left: coords.left }}

                    >
                        <div className="menu-user">
                            <div className="menu-avatar">{initials}</div>
                            <div className="menu-user-text">
                                <h4>{user?.name}</h4>
                                <p>{user?.email}</p>
                            </div>
                        </div>

                        <div className="menu-role-row">
                            <span>Role</span>
                            <span className="menu-role-badge">{role?.role}</span>
                        </div>

                        <button
                            className="logout-btn"
                            onClick={() => {
                                setOpen(false);
                                onLogout?.();
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Log out
                        </button>
                    </div>,
                    document.body
                )}
        </div>
    );
}


// import { useState, useRef, useEffect } from "react";
// import "./userinfo.css";

// export default function UserInfo({ user, role, onLogout }) {
//     const [open, setOpen] = useState(false);
//     const menuRef = useRef();

//     useEffect(() => {
//         const handleClick = (e) => {
//             if (menuRef.current && !menuRef.current.contains(e.target)) {
//                 setOpen(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClick);
//         return () => document.removeEventListener("mousedown", handleClick);
//     }, []);

//     return (
//         <div className="user-info" ref={menuRef}>
//             <div
//                 className="user-trigger"
//                 onClick={() => setOpen(!open)}
//             >
//                 <img
//                     src="https://ui-avatars.com/api/?name=User&background=random"
//                     alt="profile"
//                     className="user-avatar"
//                 />

//                 <div className="user-role">
//                     {role.role}
//                 </div>
//             </div>

//             {open && (
//                 <div className="user-menu">
//                     <div className="menu-user">
//                         <img
//                             src="https://ui-avatars.com/api/?name=User&background=random"
//                             alt="profile"
//                             className="menu-avatar"
//                         />

//                         <div>
//                             <h4>{user?.name}</h4>
//                             <p>{user?.email}</p>
//                         </div>
//                     </div>

//                     <div className="menu-divider"></div>

//                     <div className="menu-role">
//                         Role: <span>{role.role}</span>
//                     </div>

//                     <button
//                         className="logout-btn"
//                         onClick={onLogout}
//                     >
//                         Logout
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }