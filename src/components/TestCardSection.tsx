import { CreditCard } from "lucide-react";

const TestCardSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-pink-accent/20 to-accent/20">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
            Try Our Test Card
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-3">
            Use the Stripe test card below to try transactions in <span className="font-semibold">Test Mode</span>. 
            You can explore subscriptions, checkouts, and other payment flows without using real money.
          </p>
        </div>

        {/* Card Box */}
        <div
          className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-card border border-border p-6 flex flex-col sm:flex-row gap-6 items-center 
                     transition-all duration-300 transform hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]
                     hover:border-purple-400 group"
        >
          {/* Image */}
          <div className="w-60 h-36 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30 border border-border">
            <img
              src="test_card.png" // replace with your image path
              alt="Stripe Test Card"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-500" /> Test Card Details
                </h3>
                <p className="text-sm text-accent/90 mt-1">For demo & sandbox mode only</p>
              </div>
            </div>

            {/* Card Numbers */}
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Card Number:</span> 4242 4242 4242 4242
              </p>
              <p>
                <span className="font-semibold text-foreground">Expiry Date:</span> 12 / 34
              </p>
              <p>
                <span className="font-semibold text-foreground">CVC:</span> 123
              </p>
            </div>

            {/* Note */}
            <p className="mt-4 text-xs text-muted-foreground italic">
              💡 Use this in the checkout to subscribe or make test payments. No real transactions will be made.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestCardSection;
