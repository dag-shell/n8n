import type { AuthenticatedRequest } from '@n8n/db';
import { Get, RestController } from '@n8n/decorators';
import si from 'systeminformation';

function formatBytes(bytes: number): string {
	if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatSpeed(bytesPerSec: number): string {
	if (!bytesPerSec || isNaN(bytesPerSec) || bytesPerSec <= 0) return '0 B/s';
	return `${formatBytes(bytesPerSec)}/s`;
}

function getCpuMetrics(
	cpuLoad: si.Systeminformation.CurrentLoadData,
	cpuInfo: si.Systeminformation.CpuData,
) {
	const cpuUsagePercent = Math.min(100, Math.max(0, Math.round(cpuLoad.currentLoad || 0)));
	const cpuModel =
		[cpuInfo.manufacturer, cpuInfo.brand].filter(Boolean).join(' ').trim() || 'Unknown';
	const loadAvg = [
		typeof cpuLoad.avgLoad === 'number' ? cpuLoad.avgLoad : 0,
		...(cpuLoad.cpus?.map((c) => c.load) ?? []),
	];

	return {
		cores: cpuInfo.cores || 1,
		physicalCores: cpuInfo.physicalCores || 1,
		model: cpuModel,
		speed: cpuInfo.speed,
		loadAverage: loadAvg,
		usage: cpuUsagePercent,
		usagePercent: cpuUsagePercent,
		load: typeof cpuLoad.avgLoad === 'number' ? cpuLoad.avgLoad : 0,
	};
}

function getMemoryMetrics(mem: si.Systeminformation.MemData) {
	const totalMem = mem.total || 0;
	const usedMem = mem.active || Math.max(0, totalMem - (mem.available || mem.free || 0));
	const freeMem = mem.available || mem.free || 0;
	const memoryUsagePercent =
		totalMem > 0 ? Math.min(100, Math.max(0, Math.round((usedMem / totalMem) * 100))) : 0;

	return {
		total: totalMem,
		used: usedMem,
		free: freeMem,
		totalGb: parseFloat((totalMem / 1024 ** 3).toFixed(2)),
		usedGb: parseFloat((usedMem / 1024 ** 3).toFixed(2)),
		freeGb: parseFloat((freeMem / 1024 ** 3).toFixed(2)),
		percentage: memoryUsagePercent,
		usagePercent: memoryUsagePercent,
		totalFormatted: formatBytes(totalMem),
		usedFormatted: formatBytes(usedMem),
		freeFormatted: formatBytes(freeMem),
		swap: {
			total: mem.swaptotal,
			used: mem.swapused,
			free: mem.swapfree,
		},
	};
}

function getStorageMetrics(fsSizes: si.Systeminformation.FsSizeData[]) {
	const rootFs = fsSizes.find((f) => f.mount === '/') ??
		fsSizes[0] ?? {
			fs: '',
			type: '',
			size: 0,
			used: 0,
			available: 0,
			use: 0,
			mount: '/',
		};
	const storageTotal = rootFs.size || 0;
	const storageUsed = rootFs.used || 0;
	const storageAvailable = rootFs.available || 0;
	const storageUsagePercent = Math.min(100, Math.max(0, Math.round(rootFs.use || 0)));

	return {
		total: storageTotal,
		used: storageUsed,
		available: storageAvailable,
		free: storageAvailable,
		totalGb: parseFloat((storageTotal / 1024 ** 3).toFixed(2)),
		usedGb: parseFloat((storageUsed / 1024 ** 3).toFixed(2)),
		freeGb: parseFloat((storageAvailable / 1024 ** 3).toFixed(2)),
		percentage: storageUsagePercent,
		usagePercent: storageUsagePercent,
		totalFormatted: formatBytes(storageTotal),
		usedFormatted: formatBytes(storageUsed),
		availableFormatted: formatBytes(storageAvailable),
		disks: fsSizes.map((d) => ({
			fs: d.fs,
			type: d.type,
			mount: d.mount,
			size: d.size,
			used: d.used,
			available: d.available,
			usagePercent: Math.round(d.use || 0),
			sizeFormatted: formatBytes(d.size),
			usedFormatted: formatBytes(d.used),
			availableFormatted: formatBytes(d.available),
		})),
	};
}

function getNetworkMetrics(netStats: si.Systeminformation.NetworkStatsData[]) {
	let rxBytes = 0;
	let txBytes = 0;
	let rxSec = 0;
	let txSec = 0;

	const activeInterfaces = (netStats || []).filter((s) => s.iface !== 'lo');
	for (const iface of activeInterfaces) {
		rxBytes += iface.rx_bytes || 0;
		txBytes += iface.tx_bytes || 0;
		if (iface.rx_sec && iface.rx_sec > 0) rxSec += iface.rx_sec;
		if (iface.tx_sec && iface.tx_sec > 0) txSec += iface.tx_sec;
	}

	return {
		rxBytes,
		txBytes,
		rxSec: Math.round(rxSec),
		txSec: Math.round(txSec),
		download: Math.round(rxSec),
		upload: Math.round(txSec),
		totalDownloaded: rxBytes,
		totalUploaded: txBytes,
		rxFormatted: formatBytes(rxBytes),
		txFormatted: formatBytes(txBytes),
		rxSecFormatted: formatSpeed(rxSec),
		txSecFormatted: formatSpeed(txSec),
		interfaces: activeInterfaces.map((i) => ({
			iface: i.iface,
			operstate: i.operstate,
			rxBytes: i.rx_bytes,
			txBytes: i.tx_bytes,
			rxSec: i.rx_sec ? Math.round(i.rx_sec) : 0,
			txSec: i.tx_sec ? Math.round(i.tx_sec) : 0,
		})),
	};
}

async function collectHostMetrics() {
	const [cpuLoad, cpuInfo, mem, fsSizes, netStats, osInfo, time] = await Promise.all([
		si.currentLoad(),
		si.cpu(),
		si.mem(),
		si.fsSize(),
		si.networkStats(),
		si.osInfo(),
		si.time(),
	]);

	const cpu = getCpuMetrics(cpuLoad, cpuInfo);
	const memory = getMemoryMetrics(mem);
	const storage = getStorageMetrics(fsSizes);
	const network = getNetworkMetrics(netStats);

	return {
		cpu,
		memory,
		storage,
		network,
		system: {
			hostname: osInfo.hostname || 'Unknown',
			platform: osInfo.platform || 'Unknown',
			distro: osInfo.distro || '',
			arch: osInfo.arch || 'Unknown',
			release: osInfo.release || 'Unknown',
			kernel: osInfo.kernel || osInfo.release || 'Unknown',
			uptime: Math.round(time.uptime || 0),
			nodeVersion: process.version,
		},
		host: {
			hostname: osInfo.hostname || 'Unknown',
			platform: osInfo.platform || 'Unknown',
			distro: osInfo.distro || '',
			arch: osInfo.arch || 'Unknown',
			kernel: osInfo.kernel || osInfo.release || 'Unknown',
			uptime: Math.round(time.uptime || 0),
		},
		timestamp: Date.now(),
	};
}

@RestController('/host-metrics')
export class HostMetricsController {
	@Get('/')
	async getMetrics(_req: AuthenticatedRequest) {
		return await collectHostMetrics();
	}
}
