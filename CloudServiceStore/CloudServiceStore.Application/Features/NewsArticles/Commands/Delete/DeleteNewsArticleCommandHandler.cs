using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.NewsArticles.Commands.Delete;

public class DeleteNewsArticleCommandHandler : IRequestHandler<DeleteNewsArticleCommand, bool>
{
    private readonly IRepository<NewsArticle> _newsRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteNewsArticleCommandHandler(IRepository<NewsArticle> newsRepository, IUnitOfWork unitOfWork)
    {
        _newsRepository = newsRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteNewsArticleCommand request, CancellationToken cancellationToken)
    {
        var article = await _newsRepository.GetByIdAsync(request.Id);
        if (article == null)
            return false;

        _newsRepository.Delete(article);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
