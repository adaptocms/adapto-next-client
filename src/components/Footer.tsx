export default function Footer() {
  return (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <a href="https://adaptocms.com" target="_blank" rel="noopener noreferrer">
          Adapto CMS
        </a>
        . All rights reserved.
      </p>
    </footer>
  );
}
