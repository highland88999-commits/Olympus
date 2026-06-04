import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' as any });

export default async function handler(req: any, res: any) {
    const { products, referral_id } = req.body;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map((p: any) => ({
            price_data: { 
                currency: 'cad', 
                product_data: { name: p.name, description: `Size: ${p.size}` }, 
                unit_amount: 5000 
            },
            quantity: 1
        })),
        mode: 'payment',
        // THIS IS THE KEY: We attach the ID here
        client_reference_id: referral_id,
        success_url: 'https://nexusvortex.ca/success',
        cancel_url: 'https://nexusvortex.ca',
    });

    res.status(200).json({ url: session.url });
}
