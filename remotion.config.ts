import { Config } from 'remotion';

Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420');
Config.setCodec('h264');
Config.setChromiumDisableWebSecurity(false);
Config.setConcurrency(4);
Config.setFrameRange([0, 100]);

// Point Market Agent video configuration
Config.setDefaultCodec('h264');
Config.setDefaultPixelFormat('yuv420');
Config.setDefaultNumberOfShares(1);
Config.setBrowserExecutable(undefined);

// Output settings
Config.setOutputLocation('./videos');
