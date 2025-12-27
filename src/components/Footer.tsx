const Footer = () => {
  return (
    <footer className="py-8 bg-primary">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-semibold text-primary-foreground">
            MainStreetIRL
          </span>
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} MainStreetIRL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
