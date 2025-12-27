interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="py-8 md:py-12 lg:py-16 border-b border-border">
      <div className="container">
        <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-primary mb-2 md:mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
