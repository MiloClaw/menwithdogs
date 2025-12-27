interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="py-12 md:py-16 border-b border-border">
      <div className="container">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-primary mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
