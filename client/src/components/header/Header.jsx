import './header.css'

export default function Header() {
    return (
        <div className="header">
            <div className="headerTitles">
                <span className="headerTitleSm">Travel & Experience</span>
                <span className="headerTitleLg">BLOG</span>
            </div>
            <img
                className="headerImg"
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"
                alt="Travel header"
            />
      </div>
    )
}
