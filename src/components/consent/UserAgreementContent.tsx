import React from 'react';

/**
 * 《用户服务协议》全文。
 * 适配「光序速练」：服务内容为 5 种指尖自测模式；开发公司与管辖地保留参考原值。
 */
export const UserAgreementContent: React.FC = () => (
  <div className="max-w-none">
    <h1 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 text-center mb-2">用户服务协议</h1>
    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8">更新日期：2026年11月22日</p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      1. 协议的接受
    </h2>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">欢迎使用「光序速练」应用（以下简称「本应用」）。</p>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">
      本协议是您与光年跃迁（温州）科技有限公司（以下简称「我们」）之间关于使用本应用的法律协议。
    </p>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">
      通过下载、安装或使用本应用，您表示同意接受本协议的全部条款和条件。
    </p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      2. 服务内容
    </h2>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">本应用提供以下指尖操作能力自测服务：</p>
    <ul className="list-disc pl-6 mb-5 space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
      <li>点按测速：限时或限次点击随机光点，测量每秒点击频率（CPS）与瞬时峰值</li>
      <li>节奏跟测：跟随节拍提示完成打击，测量节奏同步精度与平均时差</li>
      <li>反应测速：测量视觉刺激下的反应时延</li>
      <li>连贯滑动测试：按序滑动连接编号光点，测量连续操作的流畅度</li>
      <li>多指矩阵测试：多点同时点击矩阵目标，测量多触点操作效率</li>
    </ul>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      3. 用户义务
    </h2>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">作为本应用的用户，您同意：</p>
    <ul className="list-disc pl-6 mb-5 space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
      <li>遵守本协议的所有条款</li>
      <li>不使用本应用进行任何非法活动</li>
      <li>不干扰本应用的正常运行</li>
      <li>保护您的设备安全，防止未授权访问</li>
    </ul>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      4. 知识产权
    </h2>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">
      本应用的所有内容，包括但不限于文字、图像、音频、视频、软件等，均受知识产权法律保护。
    </p>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">
      未经我们的书面许可，您不得复制、修改、分发或商业使用本应用的任何内容。
    </p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      5. 免责声明
    </h2>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">本应用按「原样」提供，不做任何形式的保证。</p>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">我们不保证：</p>
    <ul className="list-disc pl-6 mb-5 space-y-2 text-slate-700 dark:text-slate-300 leading-relaxed">
      <li>本应用将符合您的要求</li>
      <li>本应用将无中断、及时、安全或无错误地运行</li>
      <li>本应用的使用结果将准确或可靠</li>
    </ul>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      6. 终止
    </h2>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">
      我们有权在任何时候，出于任何原因，终止或暂停您对本应用的访问。
    </p>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">您也可以随时停止使用本应用。</p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      7. 适用法律
    </h2>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">本协议受中华人民共和国法律管辖。</p>
    <p className="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">
      任何与本协议相关的争议，应通过友好协商解决；协商不成的，应提交至温州市有管辖权的人民法院诉讼解决。
    </p>
  </div>
);
