export default function Container({ children, className = '', as: Element = "div" }) {
  return (
    <Element
      className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </Element>
  );
}