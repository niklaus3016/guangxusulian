import React from 'react';

/**
 * 《隐私政策》全文。
 * 适配「光序速练」真实行为：不收集个人/设备信息，数据仅存本机；
 * 开发公司「光年跃迁（温州）科技有限公司」与联系邮箱按参考保留，生效日期为今日。
 */
export const PrivacyPolicyContent: React.FC = () => (
  <div className="max-w-none">
    <h1 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 text-center mb-2">隐私政策</h1>
    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
      <strong>生效日期</strong>：2026年11月22日
    </p>

    <div className="bg-cyan-50/70 dark:bg-cyan-950/30 p-5 rounded-xl border-l-4 border-cyan-500 mb-6">
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        欢迎使用「光序速练」（以下简称"本应用"）。本应用由
        <strong className="text-slate-900 dark:text-white">光年跃迁（温州）科技有限公司</strong>
        （以下简称"我们"）开发并运营。我们深知个人信息对您的重要性，将严格遵守《中华人民共和国个人信息保护法》等相关法律法规，保护您的个人信息安全。
      </p>
    </div>

    <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
      本隐私政策旨在说明我们如何收集、使用、存储和保护您在使用本应用过程中产生的信息，以及您对这些信息所享有的权利。请您在使用本应用前仔细阅读并充分理解本政策的全部内容，尤其是加粗的条款。如您对本政策有任何疑问、意见或建议，可通过本政策末尾提供的联系方式与我们联系。
    </p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      一、我们收集的信息
    </h2>
    <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
      本应用<strong className="text-slate-900 dark:text-white">不收集</strong>您的任何个人身份信息或设备信息。在您使用过程中产生的以下内容仅保存在您的设备本地，不会上传：
    </p>
    <ol className="list-decimal pl-6 mb-6 space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
      <li>
        <strong className="text-slate-900 dark:text-white">自测记录</strong>
        ：您在点按测速、节奏跟测、反应测速、连贯滑动、多指矩阵等模式下主动生成的测试结果（如点击频率 CPS、反应时延、完成耗时、准确率、个人最佳等），用于为您呈现历史记录与个人最佳。
      </li>
      <li>
        <strong className="text-slate-900 dark:text-white">偏好设置</strong>
        ：您在参数设置中选择的主题、音效、震动、光点形状与尺寸、点空计失误开关等配置。
      </li>
    </ol>
    <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
      我们<strong className="text-slate-900 dark:text-white">不会</strong>收集设备型号、操作系统版本、设备标识符（如 IMEI / OAID / MAC 地址 / Android ID）、IP 地址或任何可识别您个人身份的信息，也不接入任何账号体系。
    </p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      二、我们如何使用信息
    </h2>
    <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
      我们仅在实现本应用核心功能所必需的范围内使用上述信息，且全部处理均在您的设备本地完成：
    </p>
    <ol className="list-decimal pl-6 mb-6 space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
      <li>
        <strong className="text-slate-900 dark:text-white">提供核心功能</strong>
        ：使用本机存储的自测记录为您呈现历史记录与个人最佳；使用偏好设置应用界面外观与测试规则。
      </li>
      <li>
        <strong className="text-slate-900 dark:text-white">本地统计</strong>
        ：对自测数据的统计与个人最佳计算仅在您的设备本地完成，不会上传至任何服务器。
      </li>
    </ol>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      三、我们如何共享、转让和公开披露信息
    </h2>
    <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
      我们郑重承诺：<strong className="text-slate-900 dark:text-white">不会</strong>向任何第三方共享、转让或公开披露您的信息。本应用不接入第三方数据统计、广告投放、社交分享或支付内购类 SDK，所有数据始终保留在您的设备本地。
    </p>
    <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
      仅在法律法规明确规定，或行政、司法机关依法提出强制性要求时，我们才可能予以配合；但因相关数据仅存储于您的设备，我们无法主动获取或提供您设备中的数据。
    </p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      四、我们如何存储和保护信息
    </h2>
    <ol className="list-decimal pl-6 mb-6 space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
      <li>
        <strong className="text-slate-900 dark:text-white">存储位置</strong>
        ：您的自测记录与偏好设置仅存储于您设备的本地存储空间，<strong className="text-slate-900 dark:text-white">不会上传至境内或境外的任何服务器</strong>。
      </li>
      <li>
        <strong className="text-slate-900 dark:text-white">存储期限</strong>
        ：在您主动删除记录或卸载本应用之前，数据将保留在本机；您可随时在应用内删除。
      </li>
      <li>
        <strong className="text-slate-900 dark:text-white">安全措施</strong>
        ：数据完全处于您的设备控制之下，您可通过设备系统提供的安全机制（如锁屏、加密）加以保护。
      </li>
    </ol>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      五、您的权利
    </h2>
    <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">根据相关法律法规，您对您的信息享有以下权利：</p>
    <ol className="list-decimal pl-6 mb-6 space-y-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
      <li><strong className="text-slate-900 dark:text-white">访问权</strong>：您可以在「历史记录」中查看自测记录与个人最佳。</li>
      <li><strong className="text-slate-900 dark:text-white">更正权</strong>：您可以在「参数设置」中随时修改偏好设置。</li>
      <li><strong className="text-slate-900 dark:text-white">删除权</strong>：您可以删除单条记录，或在「参数设置 → 本地测试记录管理」中一键清除全部记录，应用将立即删除相关数据。</li>
      <li><strong className="text-slate-900 dark:text-white">数据导出</strong>：本应用所有数据存储在您的设备本地，您可以通过设备备份等方式自行导出。</li>
    </ol>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      六、未成年人保护
    </h2>
    <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
      我们非常重视对未成年人个人信息的保护。如您是未满 14 周岁的未成年人，在使用本应用前，应在监护人的指导下仔细阅读本政策，并征得监护人的同意。
    </p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      七、本政策的更新
    </h2>
    <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
      我们可能会根据法律法规的更新、业务的调整或技术的发展，适时对本隐私政策进行修订。修订后的政策将在本应用内显著位置公示，并在生效前通过合理方式通知您。如您继续使用本应用，即表示您同意接受修订后的政策。
    </p>

    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-7 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
      八、联系我们
    </h2>
    <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
      如您对本隐私政策有任何疑问、意见或建议，或需要行使您的相关权利，请通过以下方式与我们联系：
    </p>
    <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
      <p className="text-slate-700 dark:text-slate-300">
        <strong className="text-slate-900 dark:text-white">电子邮箱</strong>：Jp112022@163.com
      </p>
    </div>

    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
      <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">感谢您使用光序速练！</p>
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">我们致力于为您提供便捷、可靠的指尖操作自测服务。</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">© 2026 光年跃迁（温州）科技有限公司 版权所有</p>
    </div>
  </div>
);
