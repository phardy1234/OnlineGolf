import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { logOut } from '../../firebase/auth'
import { CATEGORIES } from '../../types'

export function NavBar() {
  const { user, profile } = useAuth()
  const { count } = useCart()

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand">
          ⛳ Online Golf
        </NavLink>

        <nav className="navbar__links">
          {CATEGORIES.map((c) => (
            <NavLink key={c.value} to={`/category/${c.value}`}>
              {c.label}
            </NavLink>
          ))}
          <NavLink to="/contact">Contact Us</NavLink>
        </nav>

        <div className="navbar__actions">
          <NavLink to="/cart" className="navbar__cart">
            Cart{count > 0 ? ` (${count})` : ''}
          </NavLink>
          {profile?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button type="button" className="link-button" onClick={() => logOut()}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log In</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
