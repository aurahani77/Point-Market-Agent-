/* ========== Branches Manager ========== */
class BranchesManager {
    constructor() {
        this.branches = [];
        this.defaultBranches = [
            // Region: Riyadh
            { name: 'Khuriss', city: 'Riyadh', lat: 24.7456, lng: 46.6260, staff: 15, cost: 5000, revenue: 25000 },
            { name: 'Al Noor', city: 'Riyadh', lat: 24.7128, lng: 46.6753, staff: 12, cost: 4500, revenue: 22000 },
            { name: 'Olaya', city: 'Riyadh', lat: 24.7641, lng: 46.6755, staff: 18, cost: 6000, revenue: 28000 },
            { name: 'Malaz', city: 'Riyadh', lat: 24.7500, lng: 46.7500, staff: 10, cost: 4000, revenue: 20000 },
            { name: 'Al Wadi', city: 'Riyadh', lat: 24.6500, lng: 46.6000, staff: 14, cost: 4800, revenue: 23000 },

            // Region: Jeddah
            { name: 'Al Balad', city: 'Jeddah', lat: 21.5433, lng: 39.1728, staff: 16, cost: 5500, revenue: 26000 },
            { name: 'Tahlia', city: 'Jeddah', lat: 21.5898, lng: 39.1725, staff: 13, cost: 4700, revenue: 21000 },
            { name: 'Al Shatie', city: 'Jeddah', lat: 21.5331, lng: 39.1725, staff: 11, cost: 4200, revenue: 19000 },
            { name: 'Obhur', city: 'Jeddah', lat: 21.5400, lng: 39.0900, staff: 12, cost: 4400, revenue: 20500 },
            { name: 'Downtown Jeddah', city: 'Jeddah', lat: 21.5485, lng: 39.1726, staff: 17, cost: 5700, revenue: 27000 },

            // Region: Dammam
            { name: 'Khobar', city: 'Dammam', lat: 26.2139, lng: 50.2069, staff: 14, cost: 4900, revenue: 24000 },
            { name: 'Dhahran', city: 'Dammam', lat: 26.1393, lng: 50.1387, staff: 13, cost: 4600, revenue: 21500 },
            { name: 'Al Bukhariyah', city: 'Dammam', lat: 26.1167, lng: 50.2000, staff: 11, cost: 4100, revenue: 19500 },
            { name: 'Ras Tanura', city: 'Dammam', lat: 26.6372, lng: 50.0422, staff: 9, cost: 3800, revenue: 18000 },
            { name: 'Qatif', city: 'Dammam', lat: 26.1783, lng: 50.0178, staff: 10, cost: 3900, revenue: 18500 },

            // Region: Makkah
            { name: 'Makkah Center', city: 'Makkah', lat: 21.4225, lng: 39.8262, staff: 20, cost: 7000, revenue: 32000 },
            { name: 'Abraj Al Bait', city: 'Makkah', lat: 21.4254, lng: 39.8265, staff: 19, cost: 6800, revenue: 31000 },
            { name: 'Al Aziziyah', city: 'Makkah', lat: 21.4394, lng: 39.8608, staff: 15, cost: 5200, revenue: 24500 },
            { name: 'Jiyad', city: 'Makkah', lat: 21.4169, lng: 39.8154, staff: 17, cost: 5900, revenue: 27500 },

            // Region: Medina
            { name: 'Medina Center', city: 'Medina', lat: 24.4672, lng: 39.6024, staff: 16, cost: 5600, revenue: 26000 },
            { name: 'Al Noor', city: 'Medina', lat: 24.4713, lng: 39.5982, staff: 13, cost: 4500, revenue: 21000 },
            { name: 'Al Manara', city: 'Medina', lat: 24.4826, lng: 39.6141, staff: 12, cost: 4300, revenue: 20000 },

            // Region: Abha
            { name: 'Abha Downtown', city: 'Abha', lat: 18.2164, lng: 42.5053, staff: 11, cost: 3800, revenue: 18500 },
            { name: 'Al Safa Mall', city: 'Abha', lat: 18.2256, lng: 42.5061, staff: 10, cost: 3700, revenue: 17500 },

            // Region: Taif
            { name: 'Taif Center', city: 'Taif', lat: 21.2808, lng: 40.4158, staff: 12, cost: 4100, revenue: 19500 },
            { name: 'Al Hawiya', city: 'Taif', lat: 21.2788, lng: 40.4107, staff: 10, cost: 3800, revenue: 18000 },

            // Region: Qassim
            { name: 'Riyadh Al Qassim', city: 'Qassim', lat: 26.1648, lng: 46.7249, staff: 11, cost: 3900, revenue: 18500 },
            { name: 'Al Bukayriyah', city: 'Qassim', lat: 26.0167, lng: 45.8500, staff: 9, cost: 3400, revenue: 16500 },

            // Region: Hail
            { name: 'Hail Center', city: 'Hail', lat: 27.5204, lng: 41.6884, staff: 10, cost: 3600, revenue: 17500 },

            // Region: Al Jouf
            { name: 'Sakaka', city: 'Al Jouf', lat: 29.9750, lng: 40.2060, staff: 9, cost: 3300, revenue: 16000 },

            // Region: Tabuk
            { name: 'Tabuk Center', city: 'Tabuk', lat: 28.3837, lng: 36.5753, staff: 10, cost: 3700, revenue: 17500 },

            // Region: Asir
            { name: 'Khamis Mushayt', city: 'Asir', lat: 18.2990, lng: 42.7408, staff: 11, cost: 3900, revenue: 18500 }
        ];
    }

    async initialize() {
        try {
            this.branches = await db.getAll('branches');

            if (this.branches.length === 0) {
                await this.seedDefaultBranches();
            }
        } catch (error) {
            console.error('Error initializing branches:', error);
        }
    }

    async seedDefaultBranches() {
        for (const branch of this.defaultBranches) {
            try {
                const newBranch = {
                    ...branch,
                    createdAt: dateUtils.getCurrentDateTime(),
                    status: 'active'
                };
                const id = await db.add('branches', newBranch);
                newBranch.id = id;
            } catch (error) {
                console.error('Error seeding branch:', error);
            }
        }

        this.branches = await db.getAll('branches');
    }

    getBranch(id) {
        return this.branches.find(b => b.id === id);
    }

    getBranches() {
        return this.branches;
    }

    getBranchByName(name) {
        return this.branches.find(b => b.name === name);
    }

    getBranchesByCity(city) {
        return this.branches.filter(b => b.city === city);
    }

    getCities() {
        const cities = new Set(this.branches.map(b => b.city));
        return Array.from(cities).sort();
    }

    async updateBranch(id, data) {
        try {
            const branch = { ...data, id, updatedAt: dateUtils.getCurrentDateTime() };
            await db.put('branches', branch);

            const index = this.branches.findIndex(b => b.id === id);
            if (index !== -1) {
                this.branches[index] = branch;
            }

            return { success: true, branch };
        } catch (error) {
            console.error('Error updating branch:', error);
            return { success: false, error: error.message };
        }
    }

    async getBranchPerformance(branchId) {
        const inventoryStats = inventory.getBranchInventoryStats(branchId);
        const branch = this.getBranch(branchId);

        if (!branch) return null;

        return {
            branchId,
            branchName: branch.name,
            city: branch.city,
            staff: branch.staff,
            cost: branch.cost,
            revenue: branch.revenue,
            profit: branch.revenue - branch.cost,
            profitMargin: ((branch.revenue - branch.cost) / branch.revenue * 100).toFixed(2),
            inventoryValue: inventoryStats.totalValue,
            ...inventoryStats
        };
    }

    async getBranchesPerformance() {
        const performance = [];
        for (const branch of this.branches) {
            try {
                const perf = await this.getBranchPerformance(branch.id);
                if (perf) performance.push(perf);
            } catch (error) {
                console.error('Error getting performance:', error);
            }
        }
        return performance;
    }

    getTopPerformingBranches(limit = 5) {
        return arrayUtils.sortBy(this.branches, 'revenue', 'desc').slice(0, limit);
    }

    getLowestPerformingBranches(limit = 5) {
        return arrayUtils.sortBy(this.branches, 'revenue', 'asc').slice(0, limit);
    }

    getTotalMetrics() {
        return {
            totalBranches: this.branches.length,
            totalStaff: arrayUtils.sumBy(this.branches, 'staff'),
            totalCost: arrayUtils.sumBy(this.branches, 'cost'),
            totalRevenue: arrayUtils.sumBy(this.branches, 'revenue'),
            averageCost: arrayUtils.averageBy(this.branches, 'cost'),
            averageRevenue: arrayUtils.averageBy(this.branches, 'revenue')
        };
    }
}

// Initialize Branches Manager
const branches = new BranchesManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = branches;
}
