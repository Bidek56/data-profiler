const Section = ({ heading, children, className }) => (
  <section className={className}>
    <h1>{heading}</h1>
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
