import Login from "../../components/log_in/login";


function LandingPage({handleLogout, setUser, setToken, user, token }) {
    return (
        <Login
            setUser={setUser}
            setToken={setToken}
            user={user}
            token={token}
            handleLogout={handleLogout}
        />
    );
}
export default LandingPage;