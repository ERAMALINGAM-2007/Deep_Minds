
const getAuthClient = require('../config/supabaseHelper');

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const supabase = getAuthClient(token);
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const supabase = getAuthClient(token);
        const userId = req.user.id;
        const updates = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const supabase = getAuthClient(token);
        const userId = req.user.id;

        // Get total trips
        const { data: trips, error: tripsError } = await supabase
            .from('trips')
            .select('id, budget_limit')
            .eq('user_id', userId);

        if (tripsError) throw tripsError;

        // Get total destinations (stops)
        const { data: stops, error: stopsError } = await supabase
            .from('stops')
            .select('id, trip_id')
            .in('trip_id', trips.map(t => t.id));

        if (stopsError) throw stopsError;

        // Get total activities and spending
        const { data: activities, error: activitiesError } = await supabase
            .from('activities')
            .select('cost, trip_id')
            .in('trip_id', trips.map(t => t.id));

        if (activitiesError) throw activitiesError;

        const totalBudget = trips.reduce((sum, trip) => sum + (parseFloat(trip.budget_limit) || 0), 0);
        const totalSpent = activities.reduce((sum, activity) => sum + (parseFloat(activity.cost) || 0), 0);

        res.json({
            total_trips: trips.length,
            total_destinations: stops.length,
            total_budget: totalBudget,
            total_spent: totalSpent,
            total_activities: activities.length
        });
    } catch (err) {
        console.error('[User] Get stats error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};
