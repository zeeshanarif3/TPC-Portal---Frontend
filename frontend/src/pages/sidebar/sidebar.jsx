import Sideb from "../../components/side bar/sideb";



function Sidebar({
    activeItem: activeItemProp,
    onNavigate,
    defaultCollapsed = false,
    role,
    handleLogout
}) {
    return (
        <Sideb
            activeItem={activeItemProp}
            onNavigate={onNavigate}
            defaultCollapsed={defaultCollapsed}
            role={role}
            handleLogout={handleLogout}
        />
    );
}
export default Sidebar;