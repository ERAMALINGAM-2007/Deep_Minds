
const getAuthClient = require('../config/supabaseHelper');
const supabase = require('../config/db'); // Default anon client for public access

// Helper to get client and user ID (works with or without auth)
const getClientAndUserId = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ') && req.user) {
        const token = authHeader.split(' ')[1];
        return {
            client: getAuthClient(token),
            userId: req.user.id  // Use authenticated user ID
        };
    }

    // No auth - return error for operations requiring authentication
    return {
        client: supabase,
        userId: null
    };
};

// --- TRIPS ---

// Create a new trip
exports.createTrip = async (req, res) => {
    try {
        const { client, userId } = getClientAndUserId(req);
        const { title, start_date, end_date, budget_limit, currency } = req.body;

        if (!title || !start_date || !end_date) {
            return res.status(400).json({ error: 'Title, start_date, and end_date are required' });
        }

        const { data, error } = await client
            .from('trips')
            .insert([
                {
                    user_id: userId,
                    title,
                    start_date,
                    end_date,
                    budget_limit: budget_limit || 0,
                    currency: currency || 'USD'
                }
            ])
            .select()
            .single();

        if (error) throw error;
        console.log('[Trip] Created trip:', data.id);
        res.status(201).json(data);
    } catch (err) {
        console.error('[Trip] Create error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Get all trips for user
exports.getMyTrips = async (req, res) => {
    try {
        const { client, userId } = getClientAndUserId(req);

        const { data, error } = await client
            .from('trips')
            .select('*')
            .eq('user_id', userId)
            .order('start_date', { ascending: true });

        if (error) throw error;
        console.log(`[Trip] Retrieved ${data.length} trips for user ${userId}`);
        res.json(data);
    } catch (err) {
        console.error('[Trip] Get trips error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Get single trip details (with stops and activities)
exports.getTripDetails = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { id } = req.params;

        // Fetch trip
        const { data: trip, error: tripError } = await client
            .from('trips')
            .select('*')
            .eq('id', id)
            .single();

        if (tripError) throw tripError;

        // Fetch stops
        const { data: stops, error: stopsError } = await client
            .from('stops')
            .select('*, activities(*)')
            .eq('trip_id', id)
            .order('order_index', { ascending: true });

        if (stopsError) throw stopsError;

        console.log(`[Trip] Retrieved trip ${id} with ${stops?.length || 0} stops`);
        res.json({ ...trip, stops });
    } catch (err) {
        console.error('[Trip] Get trip details error:', err.message);
        res.status(404).json({ error: err.message });
    }
};

// Get public trip (No Auth required)
exports.getPublicTrip = async (req, res) => {
    try {
        const { id } = req.params;

        // Use the default anon client (no auth header needed for public trips if RLS allows)
        // RLS Policy "Users browse own trips" says: auth.uid() = user_id OR is_public = TRUE

        // Fetch trip
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('*')
            .eq('id', id)
            .eq('is_public', true) // Extra safety to force public check
            .single();

        if (tripError || !trip) {
            return res.status(404).json({ error: 'Trip not found or not public' });
        }

        // Fetch stops
        const { data: stops, error: stopsError } = await supabase
            .from('stops')
            .select('*, activities(*)')
            .eq('trip_id', id)
            .order('order_index', { ascending: true });

        if (stopsError) throw stopsError;

        res.json({ ...trip, stops });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

// Update trip
exports.updateTrip = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await client
            .from('trips')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        console.log('[Trip] Updated trip:', id);
        res.json(data);
    } catch (err) {
        console.error('[Trip] Update error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Delete trip
exports.deleteTrip = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { id } = req.params;

        const { error } = await client
            .from('trips')
            .delete()
            .eq('id', id);

        if (error) throw error;
        console.log('[Trip] Deleted trip:', id);
        res.json({ message: 'Trip deleted successfully' });
    } catch (err) {
        console.error('[Trip] Delete error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// --- STOPS ---

exports.addStop = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { trip_id } = req.params;
        const { city_name, country_code, arrival_date, order_index } = req.body;

        const { data, error } = await client
            .from('stops')
            .insert([{ trip_id, city_name, country_code, arrival_date, order_index }])
            .select()
            .single();

        if (error) throw error;
        console.log('[Stop] Added stop to trip:', trip_id);
        res.status(201).json(data);
    } catch (err) {
        console.error('[Stop] Add error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// --- ACTIVITIES ---

exports.addActivity = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { stop_id, trip_id } = req.body; // Expect trip_id for denormalization

        const { data, error } = await client
            .from('activities')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        console.log('[Activity] Added activity to trip:', trip_id);
        res.status(201).json(data);
    } catch (err) {
        console.error('[Activity] Add error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// --- BUDGET ---

exports.getTripBudget = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { id } = req.params; // Trip ID

        // Fetch trip info
        const { data: trip, error: tripError } = await client
            .from('trips')
            .select('budget_limit, currency')
            .eq('id', id)
            .single();

        if (tripError) throw tripError;

        // Fetch all activities cost
        const { data: activities, error: actError } = await client
            .from('activities')
            .select('cost, category')
            .eq('trip_id', id);

        if (actError) throw actError;

        // Calculate totals
        let totalSpent = 0;
        const categoryBreakdown = {};

        activities.forEach(act => {
            const cost = parseFloat(act.cost) || 0;
            totalSpent += cost;
            categoryBreakdown[act.category] = (categoryBreakdown[act.category] || 0) + cost;
        });

        const remaining = parseFloat(trip.budget_limit) - totalSpent;

        console.log(`[Budget] Calculated budget for trip ${id}: spent ${totalSpent}, remaining ${remaining}`);
        res.json({
            trip_id: id,
            budget_limit: parseFloat(trip.budget_limit),
            currency: trip.currency,
            total_spent: totalSpent,
            remaining,
            category_breakdown: categoryBreakdown
        });

    } catch (err) {
        console.error('[Budget] Get budget error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Update Stop
exports.updateStop = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { stop_id } = req.params;
        const updates = req.body;

        const { data, error } = await client
            .from('stops')
            .update(updates)
            .eq('id', stop_id)
            .select()
            .single();

        if (error) throw error;
        console.log('[Stop] Updated stop:', stop_id);
        res.json(data);
    } catch (err) {
        console.error('[Stop] Update error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Delete Stop
exports.deleteStop = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { stop_id } = req.params;

        // Delete associated activities first (if not using CASCADE)
        await client.from('activities').delete().eq('stop_id', stop_id);

        // Delete the stop
        const { error } = await client
            .from('stops')
            .delete()
            .eq('id', stop_id);

        if (error) throw error;
        console.log('[Stop] Deleted stop:', stop_id);
        res.json({ message: 'Stop deleted successfully' });
    } catch (err) {
        console.error('[Stop] Delete error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Update Activity
exports.updateActivity = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { activity_id } = req.params;
        const updates = req.body;

        const { data, error } = await client
            .from('activities')
            .update(updates)
            .eq('id', activity_id)
            .select()
            .single();

        if (error) throw error;
        console.log('[Activity] Updated activity:', activity_id);
        res.json(data);
    } catch (err) {
        console.error('[Activity] Update error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Delete Activity
exports.deleteActivity = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { activity_id } = req.params;

        const { error } = await client
            .from('activities')
            .delete()
            .eq('id', activity_id);

        if (error) throw error;
        console.log('[Activity] Deleted activity:', activity_id);
        res.json({ message: 'Activity deleted successfully' });
    } catch (err) {
        console.error('[Activity] Delete error:', err.message);
        res.status(400).json({ error: err.message });
    }
};

// Toggle Trip Sharing (Public/Private)
exports.toggleTripSharing = async (req, res) => {
    try {
        const { client } = getClientAndUserId(req);
        const { id } = req.params;
        const { is_public } = req.body;

        const { data, error } = await client
            .from('trips')
            .update({ is_public: is_public })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        console.log(`[Trip] Toggled sharing for trip ${id}: ${is_public ? 'public' : 'private'}`);
        res.json(data);
    } catch (err) {
        console.error('[Trip] Toggle sharing error:', err.message);
        res.status(400).json({ error: err.message });
    }
};
