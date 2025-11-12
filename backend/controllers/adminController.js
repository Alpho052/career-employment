const { db, auth } = require('../config/firebase');

// Get system statistics
const getSystemStats = async (req, res) => {
    try {
        const [
            studentsSnapshot,
            institutionsSnapshot,
            companiesSnapshot,
            jobsSnapshot,
            applicationsSnapshot,
            pendingInstitutionsSnapshot,
            pendingCompaniesSnapshot
        ] = await Promise.all([
            db.collection('students').get(),
            db.collection('institutions').where('status', '==', 'approved').get(),
            db.collection('companies').where('status', '==', 'approved').get(),
            db.collection('jobs').where('status', '==', 'active').get(),
            db.collection('applications').get(),
            db.collection('institutions').where('status', '==', 'pending').get(),
            db.collection('companies').where('status', '==', 'pending').get()
        ]);

        const stats = {
            totalStudents: studentsSnapshot.size,
            totalInstitutions: institutionsSnapshot.size,
            totalCompanies: companiesSnapshot.size,
            activeJobs: jobsSnapshot.size,
            totalApplications: applicationsSnapshot.size,
            pendingInstitutions: pendingInstitutionsSnapshot.size,
            pendingCompanies: pendingCompaniesSnapshot.size
        };

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('❌ Get system stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Manage institutions
const getInstitutions = async (req, res) => {
    try {
        const { status } = req.query;
        let query = db.collection('institutions');
        if (status) {
            query = query.where('status', '==', status);
        }
        const institutionsSnapshot = await query.get();
        const institutions = [];
        institutionsSnapshot.forEach(doc => {
            institutions.push({ id: doc.id, ...doc.data() });
        });
        res.json({
            success: true,
            institutions
        });
    } catch (error) {
        console.error('❌ Get institutions error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

const updateInstitutionStatus = async (req, res) => {
    try {
        const { institutionId } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'suspended', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        await db.collection('institutions').doc(institutionId).update({
            status,
            updatedAt: new Date()
        });

        await db.collection('users').doc(institutionId).update({
            status: status === 'suspended' ? 'suspended' : 'active',
            updatedAt: new Date()
        });

        console.log(`✅ Institution status updated: ${institutionId} -> ${status}`);

        res.json({
            success: true,
            message: 'Institution status updated successfully'
        });
    } catch (error) {
        console.error('❌ Update institution status error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

const deleteInstitution = async (req, res) => {
    try {
        const { institutionId } = req.params;
        const institutionRef = db.collection('institutions').doc(institutionId);
        const institutionDoc = await institutionRef.get();

        if (!institutionDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Institution not found'
            });
        }

        await auth.deleteUser(institutionId);

        await institutionRef.delete();
        await db.collection('users').doc(institutionId).delete();

        const coursesSnapshot = await db.collection('courses').where('institutionId', '==', institutionId).get();
        const deletePromises = coursesSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        console.log(`✅ Institution deleted: ${institutionId}`);

        res.json({
            success: true,
            message: 'Institution deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete institution error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Manage companies
const getCompanies = async (req, res) => {
    try {
        const { status } = req.query;
        let query = db.collection('companies');
        if (status) {
            query = query.where('status', '==', status);
        }
        const companiesSnapshot = await query.get();
        const companies = [];
        companiesSnapshot.forEach(doc => {
            companies.push({ id: doc.id, ...doc.data() });
        });
        res.json({
            success: true,
            companies
        });
    } catch (error) {
        console.error('❌ Get companies error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

const updateCompanyStatus = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'suspended', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        await db.collection('companies').doc(companyId).update({
            status,
            updatedAt: new Date()
        });

        await db.collection('users').doc(companyId).update({
            status: status === 'suspended' ? 'suspended' : 'active',
            updatedAt: new Date()
        });

        console.log(`✅ Company status updated: ${companyId} -> ${status}`);

        res.json({
            success: true,
            message: 'Company status updated successfully'
        });
    } catch (error) {
        console.error('❌ Update company status error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const companyRef = db.collection('companies').doc(companyId);
        const companyDoc = await companyRef.get();

        if (!companyDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }

        await auth.deleteUser(companyId);

        await companyRef.delete();
        await db.collection('users').doc(companyId).delete();

        const jobsSnapshot = await db.collection('jobs').where('companyId', '==', companyId).get();
        const deletePromises = jobsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        console.log(`✅ Company deleted: ${companyId}`);

        res.json({
            success: true,
            message: 'Company deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete company error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let query = db.collection('users');
        if (role) {
            query = query.where('role', '==', role);
        }
        const usersSnapshot = await query.get();
        const users = [];
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            users.push({
                id: doc.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                status: user.status,
                createdAt: user.createdAt
            });
        });
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('❌ Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

module.exports = {
    getSystemStats,
    getInstitutions,
    updateInstitutionStatus,
    deleteInstitution,
    getCompanies,
    updateCompanyStatus,
    deleteCompany,
    getUsers
};