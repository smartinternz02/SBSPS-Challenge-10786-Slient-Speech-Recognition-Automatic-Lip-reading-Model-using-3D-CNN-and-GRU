import WebCamera from "./WebCam";

export default function Navbar() {
    return <div className="nav-bar">
        <nav className="nav">
        <a href="/" className="site-title">LipSync</a>
        <ul>
            <li>
                <a href="/">Home</a>
            </li>
            <li>
                <a href="/About">About</a>
            </li>
            <li>
                <a href="/Contact">Contact</a>
            </li>
        </ul>
        <button className="login-button">LogIn</button>
    </nav>
    <WebCamera/>
    </div>
}