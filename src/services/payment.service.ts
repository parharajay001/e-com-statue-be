import { Request } from 'express';
import Stripe from 'stripe';
import { config } from '../config/config';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
});

interface CreatePaymentIntentParams {
  amount: number;
  orderId: string;
}

export class PaymentService {
  async createPaymentIntent({ amount, orderId }: CreatePaymentIntentParams) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  async constructWebhookEvent(req: Request) {
    const payload = req.body;
    const signature = req.headers['stripe-signature'] as string;

    return stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripeWebhookSecret
    );
  }
}