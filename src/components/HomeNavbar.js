import { Nav, Navbar, Container } from "react-bootstrap";
import "../css/custom.css";

const HomeNavbar = () => {
  return (
    <Navbar expand="lg" className="shadow-sm sticky-top bg-white py-2">
      <Container fluid className="mx-4 mx-lg-5">
        <div className="d-flex align-items-center">
          <Navbar.Brand href="/" className="me-2">
            <img
              className="transition-transform hover-scale"
              style={{ 
                maxWidth: "3.5rem",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              }}
              src={require("../assets/images/KLogo.png")}
              alt="Kwentura Logo"
              onError={(e) => {
                console.error("KLogo failed to load in HomeNavbar:", e);
                
                e.target.src = require("../assets/images/logo.png");
              }}
            />
          </Navbar.Brand>
          <div className="d-flex flex-column">
            <Navbar.Brand
              href="/home"
              className="mb-0 brand-text"
              style={{ 
                color: "#FF549A", 
                fontWeight: "bold",
                fontSize: "1.8rem",
                textDecoration: "none"
              }}
            >
              Kwentura
            </Navbar.Brand>

          </div>
        </div>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="border-0 shadow-none"
          style={{ color: "#FF549A" }}
        />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto fw-semibold align-items-center">
            <Nav.Link 
              href="/about"
              className="nav-link-custom mx-2"
            >
              About Us
            </Nav.Link>
            <Nav.Link 
              href="/contact"
              className="nav-link-custom mx-2"
            >
              Contact
            </Nav.Link>
            <Nav.Link
              href="/login"
              className="nav-link-custom mx-2"
              style={{
                color: "#FF549A",
              }}
            >
              Login
            </Nav.Link>
            <Nav.Link
              href="/signup"
              className="btn-signup ms-2"
              style={{
                backgroundColor: "#FF549A",
                borderRadius: "25px",
                color: "white",
                fontSize: "14px",
                textAlign: "center",
                padding: "10px 20px",
                minWidth: "100px",
                border: "2px solid #FF549A",
                transition: "all 0.3s ease",
                textDecoration: "none"
              }}
            >
              Sign Up
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HomeNavbar;