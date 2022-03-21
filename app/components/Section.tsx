// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  heading?: string;
  children: JSX.Element;
  className?: string;
}; // use `interface` if exporting so that consumers can extend


const Section = ({ heading, children, className }: AppProps) : JSX.Element => (
  <section className={className}>
    {heading && <h1>{heading}</h1>}
    {children}
    <style jsx>{`
      h1 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-size: 120%;
      }
      .inline {
        display: inline-block;
      }
    `}</style>
  </section>
)

export default Section
