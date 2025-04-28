import Stripe from 'stripe';
import { config } from '../config/config';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      });
      return paymentIntent;
    } catch (error) {
      throw new Error('Payment intent creation failed');
    }
  }

  async createCheckoutSession(items: Array<{ price: number; quantity: number; name: string }>) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cart`,
      });
      return session;
    } catch (error) {
      throw new Error('Checkout session creation failed');
    }
  }

  async handleWebhook(body: any, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
      return event;
    } catch (error) {
      throw new Error('Webhook signature verification failed');
    }
  }
}