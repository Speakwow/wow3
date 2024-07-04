import * as React from 'react';

// If using TypeScript, add the following snippet to your file as well.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

function PricingPage() {
  // Paste the stripe-pricing-table snippet in your React component
  return (
    <div>
    <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
<stripe-pricing-table pricing-table-id="prctbl_1PYSdRGFTlk18QL0yoqS4YpM"
publishable-key="pk_live_51PF7ofGFTlk18QL0sklSj832bDscBaC3ZnheoRG0W9hIRH4mvZBpyT8YnwgfmqXqOZeAQzU3mLJoxEBYmVKQFadS00uIvWSnH1">
</stripe-pricing-table>
    </div>
  );
}

export default PricingPage;